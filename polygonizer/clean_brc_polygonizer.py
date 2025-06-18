#!/usr/bin/env python3
"""
Clean BRC Polygonizer for Manual Edits Input
Creates 96 inner blocks + 160 outer blocks = 256 total
Handles exception polygons around 6:00 between Esplanade and A
"""

import svgpathtools
from svgpathtools import svg2paths2, Path, Line, Arc, wsvg, parse_path
from shapely.geometry import Polygon, Point, LineString
from shapely.ops import nearest_points
import numpy as np
import math
import xml.etree.ElementTree as ET
from collections import defaultdict

def extract_roads_from_manual_svg(svg_file):
    """Extract roads from manually edited SVG structure"""
    print(f"🏗️  Extracting roads from {svg_file}...")
    
    tree = ET.parse(svg_file)
    root = tree.getroot()
    
    all_rings = {}
    all_radials = {}
    center = (622.5, 272.04)
    
    # Extract Ring Roads
    ring_group = root.find(".//*[@id='Ring_Roads']")
    if ring_group is not None:
        print("🔄 Processing Ring Roads...")
        for ring_subgroup in ring_group:
            ring_id = ring_subgroup.get('id')
            if ring_id:
                for path_elem in ring_subgroup:
                    elem_tag = path_elem.tag.split('}')[-1] if '}' in path_elem.tag else path_elem.tag
                    if elem_tag == 'path':
                        d = path_elem.get('d')
                        if d:
                            try:
                                path = parse_path(d)
                                if ring_id in all_rings:
                                    combined = Path(*all_rings[ring_id], *path)
                                    all_rings[ring_id] = combined
                                else:
                                    all_rings[ring_id] = path
                                print(f"  ✓ Added ring {ring_id}")
                            except Exception as e:
                                print(f"  ✗ Error parsing ring {ring_id}: {e}")
    
    # Extract Main Radial Roads
    main_radial_group = root.find(".//*[@id='Main_Radial_Roads']")
    if main_radial_group is not None:
        print("⏰ Processing Main Radial Roads...")
        for radial_subgroup in main_radial_group:
            radial_id = radial_subgroup.get('id')
            if radial_id:
                clean_id = radial_id.lstrip('_')
                
                for elem in radial_subgroup:
                    elem_tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
                    
                    if elem_tag == 'line':
                        if all(elem.get(attr) is not None for attr in ['x1', 'y1', 'x2', 'y2']):
                            x1, y1 = float(elem.get('x1')), float(elem.get('y1'))
                            x2, y2 = float(elem.get('x2')), float(elem.get('y2'))
                            line_path = Path(Line(complex(x1, y1), complex(x2, y2)))
                            all_radials[clean_id] = line_path
                            print(f"  ✓ Added main radial {clean_id}")
                            
                    elif elem_tag == 'polyline':
                        points_str = elem.get('points')
                        if points_str:
                            try:
                                coords_flat = list(map(float, points_str.replace(',', ' ').split()))
                                coords = [complex(coords_flat[i], coords_flat[i+1]) 
                                         for i in range(0, len(coords_flat), 2)]
                                
                                if len(coords) >= 2:
                                    lines = [Line(coords[i], coords[i+1]) for i in range(len(coords) - 1)]
                                    polyline_path = Path(*lines)
                                    all_radials[clean_id] = polyline_path
                                    print(f"  ✓ Added main radial {clean_id}")
                            except Exception as e:
                                print(f"  ✗ Error parsing polyline: {e}")
    
    # Extract Secondary Radial Roads  
    secondary_radial_group = root.find(".//*[@id='Secondary_Radial_Roads']")
    if secondary_radial_group is not None:
        print("📍 Processing Secondary Radial Roads...")
        for radial_subgroup in secondary_radial_group:
            radial_id = radial_subgroup.get('id')
            if radial_id:
                clean_id = radial_id.lstrip('_')
                
                for elem in radial_subgroup:
                    elem_tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
                    if elem_tag == 'line':
                        if all(elem.get(attr) is not None for attr in ['x1', 'y1', 'x2', 'y2']):
                            x1, y1 = float(elem.get('x1')), float(elem.get('y1'))
                            x2, y2 = float(elem.get('x2')), float(elem.get('y2'))
                            line_path = Path(Line(complex(x1, y1), complex(x2, y2)))
                            
                            # Use unique ID for secondary radials
                            unique_id = f"{clean_id}_sec" if clean_id in all_radials else clean_id
                            all_radials[unique_id] = line_path
                            print(f"  ✓ Added secondary radial {unique_id}")
    
    # Generate missing time increments if needed
    print("🕐 Generating missing time increments...")
    
    expected_times = []
    for hour in range(2, 10):
        for minute in [0, 15, 30, 45]:
            time_str = f"{hour}:{minute:02d}"
            expected_times.append(time_str)
    expected_times.extend(['10:00', '2:00'])
    
    for time_str in expected_times:
        if time_str not in all_radials:
            hour, minute = map(int, time_str.split(':'))
            
            # Convert to clock angle then BRC angle
            clock_angle = (hour * 30 + minute * 0.5) % 360
            brc_angle = (clock_angle - 90) % 360
            angle_rad = math.radians(brc_angle)
            
            # Create radial from center outward
            start = complex(center[0], center[1])
            radius = 600  # Extend beyond all rings
            end = start + radius * complex(math.cos(angle_rad), math.sin(angle_rad))
            
            radial_path = Path(Line(start, end))
            all_radials[time_str] = radial_path
            print(f"  ✓ Generated missing radial {time_str}")
    
    print(f"📊 Extraction complete:")
    print(f"  Rings: {len(all_rings)} found")
    print(f"  Radials: {len(all_radials)} found")
    print(f"  Ring IDs: {sorted(all_rings.keys())}")
    print(f"  Sample Radial IDs: {sorted(list(all_radials.keys())[:10])}")
    
    return all_rings, all_radials

def find_improved_intersections(ring_path, radial_path, time_str=None, center=(622.5, 272.04), tolerance=5.0):
    """Find intersections between ring and radial paths with improved accuracy"""
    intersections = []
    
    # Try direct SVG path intersection first (most accurate)
    try:
        intersect_results = ring_path.intersect(radial_path)
        for (T1, seg1, t1), (T2, seg2, t2) in intersect_results:
            point = ring_path.point(T1)
            intersections.append((point.real, point.imag))
        if intersections:
            return intersections
    except Exception:
        pass
    
    # For synthetic radials (generated ones), use geometric calculation
    if time_str and ':' in time_str and '-' not in time_str:
        try:
            # Convert time to angle
            hour, minute = map(int, time_str.split(':'))
            clock_angle = (hour * 30 + minute * 0.5) % 360
            brc_angle = (clock_angle - 90) % 360
            angle_rad = math.radians(brc_angle)
            
            # Find intersection by sampling ring at high resolution
            best_intersection = None
            min_angle_diff = float('inf')
            
            # Use high resolution for better accuracy
            for t in np.linspace(0, 1, 2000):  # Increased from 500 to 2000
                ring_point = ring_path.point(t)
                ring_coords = (ring_point.real, ring_point.imag)
                
                # Calculate angle from center to this ring point
                dx = ring_coords[0] - center[0]
                dy = ring_coords[1] - center[1]
                point_angle = math.atan2(dy, dx)
                
                # Normalize angles to [0, 2π]
                point_angle = (point_angle + 2 * math.pi) % (2 * math.pi)
                target_angle = (angle_rad + 2 * math.pi) % (2 * math.pi)
                
                # Calculate angular difference
                angle_diff = min(abs(point_angle - target_angle), 
                               2 * math.pi - abs(point_angle - target_angle))
                
                if angle_diff < min_angle_diff:
                    min_angle_diff = angle_diff
                    best_intersection = ring_coords
            
            if best_intersection and min_angle_diff < math.radians(5):  # Tighter tolerance - within 5 degrees
                # Project intersection onto perfect radial line for straight radials
                dx = best_intersection[0] - center[0]
                dy = best_intersection[1] - center[1]
                radius = math.sqrt(dx*dx + dy*dy)
                
                # Perfect intersection on the ideal radial line
                perfect_x = center[0] + radius * math.cos(angle_rad)
                perfect_y = center[1] + radius * math.sin(angle_rad)
                perfect_intersection = (perfect_x, perfect_y)
                
                intersections.append(perfect_intersection)
                return intersections
                
        except Exception:
            pass
    
    # Fallback: high-resolution closest point method
    try:
        # Sample both paths at higher resolution
        ring_points = [(ring_path.point(t).real, ring_path.point(t).imag) 
                      for t in np.linspace(0, 1, 2000)]  # Increased from 1000
        radial_points = [(radial_path.point(t).real, radial_path.point(t).imag) 
                        for t in np.linspace(0, 1, 1000)]  # Increased from 500
        
        # Find closest approach points
        min_distance = float('inf')
        best_intersection = None
        
        for ring_pt in ring_points:
            for radial_pt in radial_points:
                dist = math.sqrt((ring_pt[0] - radial_pt[0])**2 + (ring_pt[1] - radial_pt[1])**2)
                if dist < min_distance:
                    min_distance = dist
                    best_intersection = ((ring_pt[0] + radial_pt[0]) / 2, 
                                       (ring_pt[1] + radial_pt[1]) / 2)
        
        if min_distance < tolerance * 3:  # More lenient tolerance for fallback
            intersections.append(best_intersection)
            
    except Exception:
        pass
    
    return intersections

def extract_bezier_curve_from_arc(ring_path, start_point, end_point, tolerance=20.0):
    """Extract a cubic Bezier curve approximation of the arc segment"""
    try:
        # Find parameter values
        start_t = None
        end_t = None
        
        min_start_dist = float('inf')
        min_end_dist = float('inf')
        
        for t in np.linspace(0, 1, 1000):
            point = ring_path.point(t)
            point_coords = (point.real, point.imag)
            
            start_dist = math.sqrt((point_coords[0] - start_point[0])**2 + (point_coords[1] - start_point[1])**2)
            if start_dist < min_start_dist:
                min_start_dist = start_dist
                if start_dist < tolerance:
                    start_t = t
            
            end_dist = math.sqrt((point_coords[0] - end_point[0])**2 + (point_coords[1] - end_point[1])**2)
            if end_dist < min_end_dist:
                min_end_dist = end_dist
                if end_dist < tolerance:
                    end_t = t
        
        if start_t is not None and end_t is not None:
            # Sample the arc to fit a Bezier curve
            if start_t > end_t:
                # Handle wrap-around
                t_values = list(np.linspace(start_t, 1, 10)) + list(np.linspace(0, end_t, 10))
            else:
                t_values = np.linspace(start_t, end_t, 20)
            
            # Get sample points along the arc
            arc_sample_points = []
            for t in t_values:
                point = ring_path.point(t)
                arc_sample_points.append((point.real, point.imag))
            
            # Fit a cubic Bezier curve to the sample points
            if len(arc_sample_points) >= 4:
                return fit_cubic_bezier_to_points(arc_sample_points)
            else:
                return arc_sample_points
        
    except Exception:
        pass
    
    # Fallback: return straight line
    return [start_point, end_point]


def fit_circular_arc_to_points(start_point, end_point, center=(622.5, 272.04)):
    """Fit a circular arc using known center and two points on the circle"""
    
    # Calculate radius from center to start point
    dx1 = start_point[0] - center[0]
    dy1 = start_point[1] - center[1]
    radius = math.sqrt(dx1*dx1 + dy1*dy1)
    
    # Calculate angles for start and end points
    start_angle = math.atan2(dy1, dx1)
    
    dx2 = end_point[0] - center[0]
    dy2 = end_point[1] - center[1]
    end_angle = math.atan2(dy2, dx2)
    
    # Calculate sweep angle (always take the shorter arc)
    sweep = end_angle - start_angle
    
    # Normalize to [-π, π] and take shorter arc
    if sweep > math.pi:
        sweep -= 2 * math.pi
    elif sweep < -math.pi:
        sweep += 2 * math.pi
    
    # Generate arc data for SVG
    large_arc_flag = 1 if abs(sweep) > math.pi else 0
    sweep_flag = 1 if sweep > 0 else 0
    
    return {
        'center': center,
        'radius': radius,
        'start_angle': start_angle,
        'end_angle': end_angle,
        'sweep': sweep,
        'large_arc_flag': large_arc_flag,
        'sweep_flag': sweep_flag,
        'start_point': start_point,
        'end_point': end_point
    }


def cubic_bezier_to_svg_path(control_points):
    """Convert cubic Bezier control points to SVG path data"""
    if len(control_points) < 4:
        # Fallback to line
        if len(control_points) >= 2:
            return f"M {control_points[0][0]:.1f},{control_points[0][1]:.1f} L {control_points[-1][0]:.1f},{control_points[-1][1]:.1f}"
        return ""
    
    P0, P1, P2, P3 = control_points
    return f"M {P0[0]:.1f},{P0[1]:.1f} C {P1[0]:.1f},{P1[1]:.1f} {P2[0]:.1f},{P2[1]:.1f} {P3[0]:.1f},{P3[1]:.1f}"

def create_4_sided_arc_block(time1_inner, time2_inner, time1_outer, time2_outer, center=(622.5, 272.04), block_id=None, esplanade_ring_path=None):
    """Create proper 4-sided block using circular arcs: inner arc + radial + outer arc + radial"""
    
    # Check for Esplanade exception blocks that need polyline treatment
    is_esplanade_exception = (block_id and 
                             block_id.startswith('Esplanade_') and 
                             (block_id.endswith('5:30') or block_id.endswith('6:00')))
    
    if is_esplanade_exception and esplanade_ring_path:
        # Use new approach for exception blocks with Rod's Ring Road
        return create_esplanade_exception_block(time1_inner, time2_inner, time1_outer, time2_outer, center, esplanade_ring_path, block_id)
    
    # Get circular arc data for rings
    inner_arc = fit_circular_arc_to_points(time1_inner, time2_inner, center)
    outer_arc = fit_circular_arc_to_points(time1_outer, time2_outer, center)
    
    # Create arc block data structure
    arc_block = {
        'type': 'arc',
        'points': [time1_inner, time2_inner, time2_outer, time1_outer],  # Corner intersections for Shapely
        'arc_data': {
            'inner_arc': inner_arc,
            'outer_arc': outer_arc,
            'radial1': [time1_inner, time1_outer],  # First radial (straight line)
            'radial2': [time2_inner, time2_outer]   # Second radial (straight line)
        },
        'block_data': {
            'time1_inner': time1_inner,
            'time2_inner': time2_inner,
            'time1_outer': time1_outer,
            'time2_outer': time2_outer
        }
    }
    
    return arc_block

def create_esplanade_exception_block(time1_inner, time2_inner, time1_outer, time2_outer, center=(622.5, 272.04), esplanade_ring_path=None, block_id=""):
    """Create Esplanade exception block using Rod's Ring Road arc reconstruction"""
    print(f"🔄 Creating Esplanade exception block {block_id} with Rod's Ring Road arc...")
    
    # Rod's Ring Road arc parameters
    # Center: A & 6:00 intersection point (time2_outer for Esplanade_5:30, time1_outer for Esplanade_6:00)
    rods_arc_center = time2_outer if block_id == "Esplanade_5:30" else time1_outer
    
    # Rod's Ring Road intersection points 
    rods_6_intersection = (622.5, 475.9)  # Rod's Ring Road & 6:00 intersection
    rods_esplanade_left = (564.0, 489.9)   # Leftmost Rod's Ring Road & Esplanade intersection (for 6:00)
    rods_esplanade_right = (681.0, 489.9)  # Rightmost Rod's Ring Road & Esplanade intersection (for 5:30)
    
    polygon_points = []
    
    if block_id == "Esplanade_5:30":
        # Start at Esplanade & 5:30 intersection
        polygon_points.append(time1_inner)  # Esplanade & 5:30
        
        # Generate Rod's Ring Road arc from rightmost Esplanade intersection to 6:00 intersection
        rods_radius = math.sqrt((rods_6_intersection[0] - rods_arc_center[0])**2 + 
                               (rods_6_intersection[1] - rods_arc_center[1])**2)
        
        # Calculate angles for Rod's Ring Road arc
        start_angle = math.atan2(rods_esplanade_right[1] - rods_arc_center[1], 
                                rods_esplanade_right[0] - rods_arc_center[0])
        end_angle = math.atan2(rods_6_intersection[1] - rods_arc_center[1], 
                              rods_6_intersection[0] - rods_arc_center[0])
        
        # Calculate sweep for Rod's Ring Road arc (going from rightmost to 6:00)
        sweep = end_angle - start_angle
        if sweep > math.pi:
            sweep -= 2 * math.pi
        elif sweep < -math.pi:
            sweep += 2 * math.pi
        
        # Generate 50 points along Rod's Ring Road arc (excluding endpoints to avoid duplication)
        for i in range(1, 50):  # Skip first and last to avoid duplicating intersection points
            t = i / 49.0
            angle = start_angle + t * sweep
            x = rods_arc_center[0] + rods_radius * math.cos(angle)
            y = rods_arc_center[1] + rods_radius * math.sin(angle)
            polygon_points.append((x, y))
        
        # Add Esplanade & 6:00 intersection (this matches the Rod's Ring Road & 6:00 intersection)
        polygon_points.append(time2_inner)  # Esplanade & 6:00
        
        # Line to A & 6:00
        polygon_points.append(time2_outer)  # A & 6:00
        
        # Arc from A & 6:00 to A & 5:30
        dx1 = time2_outer[0] - center[0]
        dy1 = time2_outer[1] - center[1]
        radius = math.sqrt(dx1*dx1 + dy1*dy1)
        
        start_angle = math.atan2(dy1, dx1)
        dx2 = time1_outer[0] - center[0]
        dy2 = time1_outer[1] - center[1]
        end_angle = math.atan2(dy2, dx2)
        
        sweep = end_angle - start_angle
        if sweep > math.pi:
            sweep -= 2 * math.pi
        elif sweep < -math.pi:
            sweep += 2 * math.pi
        
        # Add arc points
        for i in range(1, 10):  # 9 intermediate points
            t = i / 10.0
            angle = start_angle + t * sweep
            x = center[0] + radius * math.cos(angle)
            y = center[1] + radius * math.sin(angle)
            polygon_points.append((x, y))
        
        # Final line back to A & 5:30
        polygon_points.append(time1_outer)  # A & 5:30
    
    elif block_id == "Esplanade_6:00":
        # Start at Esplanade & 6:00 intersection
        polygon_points.append(time1_inner)  # Esplanade & 6:00
        
        # Generate Rod's Ring Road arc from 6:00 intersection to leftmost Esplanade intersection
        rods_radius = math.sqrt((rods_6_intersection[0] - rods_arc_center[0])**2 + 
                               (rods_6_intersection[1] - rods_arc_center[1])**2)
        
        # Calculate angles for Rod's Ring Road arc
        start_angle = math.atan2(rods_6_intersection[1] - rods_arc_center[1], 
                                rods_6_intersection[0] - rods_arc_center[0])
        end_angle = math.atan2(rods_esplanade_left[1] - rods_arc_center[1], 
                              rods_esplanade_left[0] - rods_arc_center[0])
        
        # Calculate sweep for Rod's Ring Road arc (going from 6:00 to leftmost)
        sweep = end_angle - start_angle
        if sweep > math.pi:
            sweep -= 2 * math.pi
        elif sweep < -math.pi:
            sweep += 2 * math.pi
        
        # Generate 50 points along Rod's Ring Road arc (excluding start point to avoid duplication)
        for i in range(1, 50):  # Skip first point to avoid duplicating 6:00 intersection
            t = i / 49.0
            angle = start_angle + t * sweep
            x = rods_arc_center[0] + rods_radius * math.cos(angle)
            y = rods_arc_center[1] + rods_radius * math.sin(angle)
            polygon_points.append((x, y))
        
        # Add the leftmost Rod's Ring Road & Esplanade intersection
        polygon_points.append(rods_esplanade_left)
        
        # Line to Esplanade & 6:30 intersection
        polygon_points.append(time2_inner)  # Esplanade & 6:30
        
        # Line to A & 6:30
        polygon_points.append(time2_outer)  # A & 6:30
        
        # Arc from A & 6:30 to A & 6:00
        dx1 = time2_outer[0] - center[0]
        dy1 = time2_outer[1] - center[1]
        radius = math.sqrt(dx1*dx1 + dy1*dy1)
        
        start_angle = math.atan2(dy1, dx1)
        dx2 = time1_outer[0] - center[0]
        dy2 = time1_outer[1] - center[1]
        end_angle = math.atan2(dy2, dx2)
        
        sweep = end_angle - start_angle
        if sweep > math.pi:
            sweep -= 2 * math.pi
        elif sweep < -math.pi:
            sweep += 2 * math.pi
        
        # Add arc points
        for i in range(1, 10):  # 9 intermediate points
            t = i / 10.0
            angle = start_angle + t * sweep
            x = center[0] + radius * math.cos(angle)
            y = center[1] + radius * math.sin(angle)
            polygon_points.append((x, y))
        
        # Final line to A & 6:00
        polygon_points.append(time1_outer)  # A & 6:00
    
    # Create exception block data structure
    exception_block = {
        'type': 'polyline_exception',
        'points': [time1_inner, time2_inner, time2_outer, time1_outer],  # Corner intersections for Shapely
        'polyline_data': {
            'polygon_points': polygon_points
        },
        'block_data': {
            'time1_inner': time1_inner,
            'time2_inner': time2_inner,
            'time1_outer': time1_outer,
            'time2_outer': time2_outer
        }
    }
    
    return exception_block

def create_4_sided_bezier_block(inner_ring_path, outer_ring_path, time1_inner, time2_inner, time1_outer, time2_outer):
    """Create proper 4-sided block using Bezier curves: inner arc + radial + outer arc + radial"""
    
    # Get Bezier curve control points for rings
    inner_bezier = extract_bezier_curve_from_arc(inner_ring_path, time1_inner, time2_inner)
    outer_bezier = extract_bezier_curve_from_arc(outer_ring_path, time1_outer, time2_outer)
    
    if len(inner_bezier) < 2 or len(outer_bezier) < 2:
        return {
            'type': 'polygon',
            'points': [time1_inner, time2_inner, time2_outer, time1_outer],  # fallback rectangle
            'bezier_data': None
        }
    
    # Create bezier block data structure
    bezier_block = {
        'type': 'bezier',
        'points': [time1_inner, time2_inner, time2_outer, time1_outer],  # Corner intersections for Shapely
        'bezier_data': {
            'inner_arc': inner_bezier,
            'outer_arc': outer_bezier,
            'radial1': [time1_inner, time1_outer],  # First radial (straight line)
            'radial2': [time2_inner, time2_outer]   # Second radial (straight line)
        },
        'block_data': {
            'time1_inner': time1_inner,
            'time2_inner': time2_inner,
            'time1_outer': time1_outer,
            'time2_outer': time2_outer
        }
    }
    
    return bezier_block

def create_4_sided_block(inner_ring_path, outer_ring_path, time1_inner, time2_inner, time1_outer, time2_outer):
    """Create proper 4-sided block: inner arc + radial + outer arc + radial"""
    
    # Get curved segments for rings (fallback to old method for Shapely compatibility)
    inner_arc = extract_bezier_curve_from_arc(inner_ring_path, time1_inner, time2_inner)
    outer_arc = extract_bezier_curve_from_arc(outer_ring_path, time1_outer, time2_outer)
    
    # Convert Bezier curves to points for Shapely (sample at low resolution)
    if len(inner_arc) >= 4 and len(outer_arc) >= 4:
        # Sample Bezier curves at a few points for polygon creation
        inner_points = sample_bezier_curve(inner_arc, 6)  # 6 points along inner arc
        outer_points = sample_bezier_curve(outer_arc, 6)  # 6 points along outer arc
    else:
        inner_points = inner_arc if len(inner_arc) >= 2 else [time1_inner, time2_inner]
        outer_points = outer_arc if len(outer_arc) >= 2 else [time1_outer, time2_outer]
    
    block_points = []
    
    # Side 1: Inner ring arc
    block_points.extend(inner_points)
    
    # Side 2: Radial from inner ring time2 to outer ring time2
    block_points.append(time2_outer)
    
    # Side 3: Outer ring arc (reversed)
    outer_points_reversed = list(reversed(outer_points))
    if len(outer_points_reversed) > 1:
        block_points.extend(outer_points_reversed[1:])  # Skip first to avoid duplicate
    
    # Side 4: Radial from outer ring time1 back to inner ring time1 (auto-closed)
    
    return block_points

def sample_bezier_curve(control_points, num_samples=10):
    """Sample points along a cubic Bezier curve"""
    if len(control_points) < 4:
        return control_points
    
    P0, P1, P2, P3 = control_points
    samples = []
    
    for i in range(num_samples):
        t = i / (num_samples - 1)  # Parameter from 0 to 1
        
        # Cubic Bezier formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
        x = ((1-t)**3 * P0[0] + 3*(1-t)**2*t * P1[0] + 
             3*(1-t)*t**2 * P2[0] + t**3 * P3[0])
        y = ((1-t)**3 * P0[1] + 3*(1-t)**2*t * P1[1] + 
             3*(1-t)*t**2 * P2[1] + t**3 * P3[1])
        
        samples.append((x, y))
    
    return samples


def find_best_intersection(intersections_dict, target_time):
    """Find the best intersection point for a given time"""
    # Try exact match first
    if target_time in intersections_dict:
        return intersections_dict[target_time]
    
    # Try compound radial names
    for radial_id, intersection in intersections_dict.items():
        if target_time in radial_id:
            return intersection
    
    return None

def create_brc_blocks(rings, radials):
    """Create the complete set of BRC blocks"""
    print("🏘️  Creating BRC blocks...")
    
    # Define ring order and division
    ring_order = ['Esplanade', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
    available_rings = [ring for ring in ring_order if ring in rings]
    
    # Define time increments to meet adjacency requirements exactly
    inner_times = ['2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30', 
                   '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00']
    
    outer_times = []
    for hour in range(2, 10):
        for minute in [0, 15, 30, 45]:
            outer_times.append(f"{hour}:{minute:02d}")
    outer_times.append('10:00')  # Add final time to complete adjacency pairs
    
    center = (622.5, 272.04)
    
    # Find intersections
    print("📐 Computing intersections...")
    intersections = defaultdict(dict)
    
    for ring_id in available_rings:
        ring_path = rings[ring_id]
        
        # Check which radials to use based on inner/outer
        if ring_id in ['Esplanade', 'A', 'B', 'C', 'D', 'E', 'F']:
            # Inner rings use main radials only
            relevant_radials = {k: v for k, v in radials.items() if '_sec' not in k}
        else:
            # Outer rings use both main and secondary radials
            relevant_radials = radials
        
        for radial_id in relevant_radials:
            radial_path = relevant_radials[radial_id]
            
            # Extract time string for geometric calculation
            time_str = None
            if ':' in radial_id and '-' not in radial_id:
                time_str = radial_id
            elif '-' in radial_id:
                # For compound radials like "3:30-9:30", try both times
                times = radial_id.split('-')
                for t in times:
                    if ':' in t:
                        time_str = t
                        break
            
            intersection_points = find_improved_intersections(ring_path, radial_path, time_str)
            if intersection_points:
                intersections[ring_id][radial_id] = intersection_points[0]
    
    # Create blocks
    blocks = []
    f_index = available_rings.index('F') if 'F' in available_rings else 6
    
    # Inner blocks (96 total)
    if f_index >= 0:
        inner_ring_pairs = [(available_rings[j], available_rings[j+1]) for j in range(f_index)]
        print(f"Inner ring pairs: {inner_ring_pairs}")
        
        for inner_ring, outer_ring in inner_ring_pairs:
            for i, time1 in enumerate(inner_times[:-1]):
                time2 = inner_times[i + 1]
                
                # Skip exception blocks for now, just create regular blocks
                # TODO: Implement proper 6:00 exception blocks later if needed
                
                # Regular 4-sided blocks
                try:
                    # Get intersection points with improved lookup
                    time1_inner = find_best_intersection(intersections[inner_ring], time1)
                    time2_inner = find_best_intersection(intersections[inner_ring], time2)
                    time1_outer = find_best_intersection(intersections[outer_ring], time1)
                    time2_outer = find_best_intersection(intersections[outer_ring], time2)
                    
                    if not all([time1_inner, time2_inner, time1_outer, time2_outer]):
                        print(f"  ✗ Missing intersections for {inner_ring}_{time1}-{time2}")
                        continue
                    
                    # Create arc, Bezier and regular versions
                    block_id = f"{inner_ring}_{time1}"
                    # Pass Esplanade ring path for exception blocks
                    esplanade_path = rings.get('Esplanade') if inner_ring == 'Esplanade' else None
                    arc_block = create_4_sided_arc_block(
                        time1_inner, time2_inner, time1_outer, time2_outer, 
                        block_id=block_id, esplanade_ring_path=esplanade_path
                    )
                    
                    bezier_block = create_4_sided_bezier_block(
                        rings[inner_ring], rings[outer_ring],
                        time1_inner, time2_inner, time1_outer, time2_outer
                    )
                    
                    curved_points = create_4_sided_block(
                        rings[inner_ring], rings[outer_ring],
                        time1_inner, time2_inner, time1_outer, time2_outer
                    )
                    
                    if len(curved_points) >= 3:
                        polygon = Polygon(curved_points)
                        if not polygon.is_valid:
                            polygon = polygon.buffer(0)
                        if polygon.is_valid and polygon.area > 0.1:
                            blocks.append({
                                'id': f"{inner_ring}_{time1}",
                                'polygon': polygon,
                                'ring': inner_ring,
                                'time': time1,
                                'type': 'inner',
                                'curved_points': curved_points,
                                'intersection_count': 4,  # Always uses exactly 4 intersections as input
                                'total_points': len(curved_points),  # Number of points after arc expansion
                                'arc_data': arc_block.get('arc_data'),  # Add circular arc data
                                'polyline_data': arc_block.get('polyline_data'),  # Add polyline exception data
                                'bezier_data': bezier_block.get('bezier_data'),  # Add Bezier curve data
                                'block_data': {
                                    'inner_ring_path': rings[inner_ring],
                                    'outer_ring_path': rings[outer_ring],
                                    'time1_inner': time1_inner,
                                    'time2_inner': time2_inner,
                                    'time1_outer': time1_outer,
                                    'time2_outer': time2_outer
                                }
                            })
                        
                except Exception as e:
                    print(f"  ✗ Inner block {inner_ring}_{time1} creation failed: {e}")
                    continue
        
    
    # Outer blocks (160 total)
    if f_index >= 0:
        remaining_rings = available_rings[f_index:]
        outer_ring_pairs = [(remaining_rings[j], remaining_rings[j+1]) for j in range(len(remaining_rings)-1)]
        print(f"Outer ring pairs: {outer_ring_pairs}")
        
        for inner_ring, outer_ring in outer_ring_pairs:
            for i, time1 in enumerate(outer_times[:-1]):
                time2 = outer_times[i + 1]
                
                try:
                    # Get intersection points with improved lookup (including secondary radials)
                    time1_inner = find_best_intersection(intersections[inner_ring], time1)
                    time2_inner = find_best_intersection(intersections[inner_ring], time2)
                    time1_outer = find_best_intersection(intersections[outer_ring], time1)
                    time2_outer = find_best_intersection(intersections[outer_ring], time2)
                    
                    if not all([time1_inner, time2_inner, time1_outer, time2_outer]):
                        print(f"  ✗ Missing intersections for {inner_ring}_{time1}-{time2}")
                        continue
                    
                    # Create arc, Bezier and regular versions
                    block_id = f"{inner_ring}_{time1}"
                    arc_block = create_4_sided_arc_block(
                        time1_inner, time2_inner, time1_outer, time2_outer, 
                        block_id=block_id
                    )
                    
                    bezier_block = create_4_sided_bezier_block(
                        rings[inner_ring], rings[outer_ring],
                        time1_inner, time2_inner, time1_outer, time2_outer
                    )
                    
                    curved_points = create_4_sided_block(
                        rings[inner_ring], rings[outer_ring],
                        time1_inner, time2_inner, time1_outer, time2_outer
                    )
                    
                    if len(curved_points) >= 3:
                        polygon = Polygon(curved_points)
                        if not polygon.is_valid:
                            polygon = polygon.buffer(0)
                        if polygon.is_valid and polygon.area > 0.1:
                            blocks.append({
                                'id': f"{inner_ring}_{time1}",
                                'polygon': polygon,
                                'ring': inner_ring,
                                'time': time1,
                                'type': 'outer',
                                'curved_points': curved_points,
                                'intersection_count': 4,  # Always uses exactly 4 intersections as input
                                'total_points': len(curved_points),  # Number of points after arc expansion
                                'arc_data': arc_block.get('arc_data'),  # Add circular arc data
                                'polyline_data': arc_block.get('polyline_data'),  # Add polyline exception data
                                'bezier_data': bezier_block.get('bezier_data'),  # Add Bezier curve data
                                'block_data': {
                                    'inner_ring_path': rings[inner_ring],
                                    'outer_ring_path': rings[outer_ring],
                                    'time1_inner': time1_inner,
                                    'time2_inner': time2_inner,
                                    'time1_outer': time1_outer,
                                    'time2_outer': time2_outer
                                }
                            })
                            
                except Exception as e:
                    print(f"  ✗ Outer block {inner_ring}_{time1} creation failed: {e}")
                    continue
        
    
    print(f"Created {len(blocks)} curved blocks")
    
    # Analyze intersection usage and Bezier data
    if blocks:
        total_points = [b['total_points'] for b in blocks]
        intersection_counts = [b['intersection_count'] for b in blocks]
        bezier_blocks = [b for b in blocks if b.get('bezier_data')]
        
        print(f"\n📊 Intersection & Bezier Analysis:")
        print(f"  All polygons use exactly {set(intersection_counts)} intersections as input")
        print(f"  Point counts after arc expansion: min={min(total_points)}, max={max(total_points)}, avg={sum(total_points)/len(total_points):.1f}")
        print(f"  Blocks with Bezier data: {len(bezier_blocks)}/{len(blocks)} ({100*len(bezier_blocks)/len(blocks):.1f}%)")
        
        # Sample of point counts
        sample_blocks = blocks[:3]
        for block in sample_blocks:
            bezier_status = "✓ Bezier" if block.get('bezier_data') else "✗ No Bezier"
            print(f"  Example: {block['id']} - {block['intersection_count']} intersections → {block['total_points']} points ({bezier_status})")
    
    # Validate radial road lengths (Esplanade-A should be ~2x longer than other ring pairs)
    inner_blocks = [b for b in blocks if b['type'].startswith('inner')]
    outer_blocks = [b for b in blocks if b['type'] == 'outer']
    
    # Calculate radial road lengths for different ring pairs
    esplanade_blocks = [b for b in inner_blocks if b['ring'] == 'Esplanade']
    other_inner_blocks = [b for b in inner_blocks if b['ring'] not in ['Esplanade']]
    
    def calculate_radial_length(block):
        """Calculate the radial road length (distance between inner and outer ring intersections)"""
        block_data = block.get('block_data', {})
        if 'time1_inner' in block_data and 'time1_outer' in block_data:
            inner_pt = block_data['time1_inner']
            outer_pt = block_data['time1_outer']
            return math.sqrt((outer_pt[0] - inner_pt[0])**2 + (outer_pt[1] - inner_pt[1])**2)
        return 0
    
    if esplanade_blocks and other_inner_blocks:
        esp_radial_lengths = [calculate_radial_length(b) for b in esplanade_blocks]
        other_radial_lengths = [calculate_radial_length(b) for b in other_inner_blocks]
        
        esp_radial_lengths = [l for l in esp_radial_lengths if l > 0]
        other_radial_lengths = [l for l in other_radial_lengths if l > 0]
        
        if esp_radial_lengths and other_radial_lengths:
            avg_esp_radial = sum(esp_radial_lengths) / len(esp_radial_lengths)
            avg_other_radial = sum(other_radial_lengths) / len(other_radial_lengths)
            radial_ratio = avg_esp_radial / avg_other_radial if avg_other_radial > 0 else 1
            print(f"Esplanade-A radial length ratio: {radial_ratio:.2f} (should be ~2.0)")
            print(f"  Avg Esplanade-A radial: {avg_esp_radial:.1f}, Other pairs: {avg_other_radial:.1f}")
    
    return blocks

def extract_actual_arc_from_ring(ring_path, start_point, end_point, tolerance=10.0):
    """Extract the actual arc segment from the original ring path between two intersection points"""
    try:
        # Find parameter values for start and end points on the ring path
        start_t = None
        end_t = None
        
        min_start_dist = float('inf')
        min_end_dist = float('inf')
        
        # Sample the ring path to find closest points to intersections
        for t in np.linspace(0, 1, 1000):
            ring_point = ring_path.point(t)
            ring_coords = (ring_point.real, ring_point.imag)
            
            start_dist = math.sqrt((ring_coords[0] - start_point[0])**2 + (ring_coords[1] - start_point[1])**2)
            if start_dist < min_start_dist:
                min_start_dist = start_dist
                if start_dist < tolerance:
                    start_t = t
            
            end_dist = math.sqrt((ring_coords[0] - end_point[0])**2 + (ring_coords[1] - end_point[1])**2)
            if end_dist < min_end_dist:
                min_end_dist = end_dist
                if end_dist < tolerance:
                    end_t = t
        
        if start_t is not None and end_t is not None:
            # Extract the actual path segment
            if start_t > end_t:
                # Handle wrap-around case
                t_range = list(np.linspace(start_t, 1, 5)) + list(np.linspace(0, end_t, 5))
            else:
                t_range = np.linspace(start_t, end_t, 8)
            
            # Get points along the actual ring curve
            curve_points = []
            for t in t_range:
                point = ring_path.point(t)
                curve_points.append((point.real, point.imag))
            
            # Convert to SVG path using the actual curve geometry
            if len(curve_points) >= 3:
                # Start with first point
                path_data = ""
                
                # Use quadratic bezier curves to approximate the real arc
                for i in range(1, len(curve_points) - 1, 2):
                    if i + 1 < len(curve_points):
                        control_pt = curve_points[i]
                        end_pt = curve_points[i + 1] if i + 1 < len(curve_points) else curve_points[-1]
                        path_data += f" Q {control_pt[0]:.1f},{control_pt[1]:.1f} {end_pt[0]:.1f},{end_pt[1]:.1f}"
                    else:
                        # Just line to final point
                        end_pt = curve_points[i]
                        path_data += f" L {end_pt[0]:.1f},{end_pt[1]:.1f}"
                
                # Ensure we end at the exact end point
                if curve_points[-1] != end_point:
                    path_data += f" L {end_point[0]:.1f},{end_point[1]:.1f}"
                
                return path_data
        
    except Exception:
        pass
    
    # Fallback: simple quadratic curve
    mid_x = (start_point[0] + end_point[0]) / 2
    mid_y = (start_point[1] + end_point[1]) / 2
    center = (622.5, 272.04)
    
    # Adjust control point based on ring curvature
    start_dist = math.sqrt((start_point[0] - center[0])**2 + (start_point[1] - center[1])**2)
    curve_factor = start_dist * 0.05
    
    dx = end_point[0] - start_point[0]
    dy = end_point[1] - start_point[1]
    perp_x = -dy
    perp_y = dx
    length = math.sqrt(perp_x**2 + perp_y**2)
    
    if length > 0:
        perp_x /= length
        perp_y /= length
        control_x = mid_x + perp_x * curve_factor
        control_y = mid_y + perp_y * curve_factor
        return f" Q {control_x:.1f},{control_y:.1f} {end_point[0]:.1f},{end_point[1]:.1f}"
    
    return f" L {end_point[0]:.1f},{end_point[1]:.1f}"

def create_polygon_svg(blocks, output_file):
    """Create SVG with proper arcs instead of many-sided polygons"""
    svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160.17 861.54">
  <defs>
    <style>
      .inner-block {
        fill: none;
        stroke: #0066cc;
        stroke-width: 0.8;
        stroke-dasharray: 3,3;
        opacity: 0.8;
      }
      .outer-block {
        fill: none;
        stroke: #cc6600;
        stroke-width: 0.8;
        stroke-dasharray: 3,3;
        opacity: 0.8;
      }
      .inner-exception {
        fill: none;
        stroke: #cc0066;
        stroke-width: 1.0;
        stroke-dasharray: 5,5;
        opacity: 0.9;
      }
    </style>
  </defs>
  <g id="BRC_Polygons">
'''
    
    for block in blocks:
        block_data = block.get('block_data', {})
        
        if ('inner_ring_path' in block_data and 'outer_ring_path' in block_data and 
            block_data['time1_inner'] is not None and block_data['time2_inner'] is not None):
            # Create path with proper arcs
            inner_start = block_data['time1_inner']
            inner_end = block_data['time2_inner']
            outer_start = block_data['time1_outer'] 
            outer_end = block_data['time2_outer']
            
            # Start at inner ring start point
            d = f"M {inner_start[0]:.1f},{inner_start[1]:.1f}"
            
            # Extract actual arc segment from inner ring
            inner_arc = extract_actual_arc_from_ring(block_data['inner_ring_path'], inner_start, inner_end)
            d += inner_arc
            
            # Straight line to outer ring end point (radial)
            d += f" L {outer_end[0]:.1f},{outer_end[1]:.1f}"
            
            # Extract actual arc segment from outer ring (reversed direction)
            outer_arc = extract_actual_arc_from_ring(block_data['outer_ring_path'], outer_end, outer_start)
            d += outer_arc
            
            # Close path (radial back to start)
            d += " Z"
            
            css_class = block['type'].replace('_', '-')
            svg_content += f'    <path id="{block["id"]}" class="{css_class}" d="{d}" />\n'
        
        else:
            # Fallback to original method for blocks without ring data
            polygon = block['polygon']
            coords = block.get('curved_points')
            
            if not coords:
                if hasattr(polygon, 'exterior'):
                    coords = list(polygon.exterior.coords)
                elif hasattr(polygon, 'geoms'):
                    largest_poly = max(polygon.geoms, key=lambda p: p.area)
                    coords = list(largest_poly.exterior.coords)
                else:
                    continue
            
            if coords:
                d = f"M {coords[0][0]:.1f},{coords[0][1]:.1f}"
                for x, y in coords[1:]:
                    d += f" L {x:.1f},{y:.1f}"
                d += " Z"
                
                css_class = block['type'].replace('_', '-')
                svg_content += f'    <path id="{block["id"]}" class="{css_class}" d="{d}" />\n'
    
    svg_content += '''  </g>
</svg>'''
    
    with open(output_file, 'w') as f:
        f.write(svg_content)
    
    return output_file

def create_combined_svg(original_svg, blocks, output_file):
    """Create combined SVG with original roads and new polygons"""
    # Read original SVG
    tree = ET.parse(original_svg)
    root = tree.getroot()
    
    # Add polygon styles to existing defs
    defs = root.find('.//{http://www.w3.org/2000/svg}defs')
    if defs is not None:
        style = defs.find('.//{http://www.w3.org/2000/svg}style')
        if style is not None:
            additional_styles = '''
      .inner-block {
        fill: none;
        stroke: #0066cc;
        stroke-width: 1.2;
        stroke-dasharray: 4,4;
        opacity: 0.7;
      }
      .outer-block {
        fill: none;
        stroke: #cc6600;
        stroke-width: 1.2;
        stroke-dasharray: 4,4;
        opacity: 0.7;
      }
      .inner-exception {
        fill: none;
        stroke: #cc0066;
        stroke-width: 1.5;
        stroke-dasharray: 6,6;
        opacity: 0.8;
      }'''
            style.text += additional_styles
    
    # Create polygon group with SVG namespace
    svg_ns = '{http://www.w3.org/2000/svg}'
    polygon_group = ET.SubElement(root, f'{svg_ns}g', {'id': 'BRC_Polygons_Overlay'})
    
    for block in blocks:
        # Use the same logic as create_arc_optimized_svg to ensure consistency
        arc_data = block.get('arc_data')
        polyline_data = block.get('polyline_data')
        bezier_data = block.get('bezier_data')
        
        d = ""
        
        if polyline_data and 'polygon_points' in polyline_data:
            # Handle new exception blocks with custom polygon points
            polygon_points = polyline_data['polygon_points']
            
            if polygon_points:
                d = f"M {polygon_points[0][0]:.1f},{polygon_points[0][1]:.1f}"
                for x, y in polygon_points[1:]:
                    d += f" L {x:.1f},{y:.1f}"
                d += " Z"
        
        elif polyline_data and 'inner_polyline' in polyline_data and 'outer_arc' in polyline_data:
            # Handle old Esplanade exception blocks with 50-point polylines
            inner_polyline = polyline_data['inner_polyline']
            outer_arc = polyline_data['outer_arc']
            radial1 = polyline_data['radial1'] 
            radial2 = polyline_data['radial2']
            
            # Create path with polyline for inner boundary
            if inner_polyline:
                d = f"M {inner_polyline[0][0]:.1f},{inner_polyline[0][1]:.1f}"
                for x, y in inner_polyline[1:]:
                    d += f" L {x:.1f},{y:.1f}"
                
                # First radial line to outer ring
                d += f" L {radial2[1][0]:.1f},{radial2[1][1]:.1f}"
                
                # Outer arc (reversed direction)
                outer_start = outer_arc['end_point']
                outer_end = outer_arc['start_point'] 
                outer_radius = outer_arc['radius']
                outer_sweep = 1 - outer_arc['sweep_flag']
                d += f" A {outer_radius:.1f},{outer_radius:.1f} 0 {outer_arc['large_arc_flag']},{outer_sweep} {outer_end[0]:.1f},{outer_end[1]:.1f}"
                
                # Z closes back to start (second radial)
                d += " Z"
        
        elif arc_data and 'inner_arc' in arc_data and 'outer_arc' in arc_data:
            inner_arc = arc_data['inner_arc']
            outer_arc = arc_data['outer_arc']
            radial1 = arc_data['radial1'] 
            radial2 = arc_data['radial2']
            
            # Create path with proper 4-sided structure using circular arcs
            # Start at inner arc start point
            start_point = inner_arc['start_point']
            d = f"M {start_point[0]:.1f},{start_point[1]:.1f}"
            
            # Inner arc (side 1)
            end_point = inner_arc['end_point']
            radius = inner_arc['radius']
            large_arc = inner_arc['large_arc_flag']
            sweep = inner_arc['sweep_flag']
            d += f" A {radius:.1f},{radius:.1f} 0 {large_arc},{sweep} {end_point[0]:.1f},{end_point[1]:.1f}"
            
            # First radial line (side 2) 
            d += f" L {radial2[1][0]:.1f},{radial2[1][1]:.1f}"
            
            # Outer arc (side 3) - reversed direction
            outer_start = outer_arc['end_point']  # Start from end (reverse)
            outer_end = outer_arc['start_point']  # End at start (reverse)
            outer_radius = outer_arc['radius']
            # Reverse the sweep direction for the outer arc
            outer_sweep = 1 - outer_arc['sweep_flag']
            d += f" A {outer_radius:.1f},{outer_radius:.1f} 0 {outer_arc['large_arc_flag']},{outer_sweep} {outer_end[0]:.1f},{outer_end[1]:.1f}"
            
            # Z command automatically draws the second radial line back to start
            d += " Z"  # Close path (second radial line: side 4)
        
        else:
            # Fallback to polygon points
            coords = block.get('curved_points', [])
            if coords:
                d = f"M {coords[0][0]:.1f},{coords[0][1]:.1f}"
                for x, y in coords[1:]:
                    d += f" L {x:.1f},{y:.1f}"
                d += " Z"
        
        if d:
            css_class = block['type'].replace('_', '-')
            ET.SubElement(polygon_group, f'{svg_ns}path', {
                'id': f"polygon_{block['id']}",
                'class': css_class,
                'd': d
            })
    
    # Write combined SVG
    tree.write(output_file, encoding='utf-8', xml_declaration=True)
    return output_file

def validate_bezier_against_original(blocks, rings):
    """Validate Bezier curves against original ring paths"""
    print(f"\n🔍 Validating Bezier curves against original paths...")
    
    ring_validation_count = {}
    total_error = 0
    validation_count = 0
    
    # Group blocks by ring to ensure we sample from all rings
    blocks_by_ring = {}
    for block in blocks:
        ring_name = block['ring']
        if ring_name not in blocks_by_ring:
            blocks_by_ring[ring_name] = []
        blocks_by_ring[ring_name].append(block)
    
    # Sample 2 blocks from each ring for validation
    for ring_name, ring_blocks in blocks_by_ring.items():
        # Get original ring path
        if ring_name not in rings:
            continue
        original_ring = rings[ring_name]
        
        for i, block in enumerate(ring_blocks[:2]):  # Max 2 per ring
            bezier_data = block.get('bezier_data')
            if not bezier_data or 'inner_arc' not in bezier_data:
                continue
            
            if ring_name not in ring_validation_count:
                ring_validation_count[ring_name] = 0
            ring_validation_count[ring_name] += 1
            
            # Get Bezier control points
            inner_bezier = bezier_data['inner_arc']
            if len(inner_bezier) < 4:
                continue
                
            # Sample both curves and compare
            bezier_samples = sample_bezier_curve(inner_bezier, 10)
            
            # Sample original path between same endpoints
            block_data = block.get('block_data', {})
            if 'time1_inner' not in block_data or 'time2_inner' not in block_data:
                continue
                
            start_pt = block_data['time1_inner']
            end_pt = block_data['time2_inner']
            
            # Find parameter values on original path
            start_t, end_t = None, None
            for t in np.linspace(0, 1, 200):
                ring_pt = original_ring.point(t)
                ring_coords = (ring_pt.real, ring_pt.imag)
                
                if math.sqrt((ring_coords[0] - start_pt[0])**2 + (ring_coords[1] - start_pt[1])**2) < 15:
                    start_t = t
                if math.sqrt((ring_coords[0] - end_pt[0])**2 + (ring_coords[1] - end_pt[1])**2) < 15:
                    end_t = t
            
            if start_t is not None and end_t is not None:
                # Sample original path
                if start_t > end_t:
                    t_vals = list(np.linspace(start_t, 1, 5)) + list(np.linspace(0, end_t, 5))
                else:
                    t_vals = np.linspace(start_t, end_t, 10)
                    
                original_samples = []
                for t in t_vals:
                    pt = original_ring.point(t)
                    original_samples.append((pt.real, pt.imag))
                
                # Calculate RMS error between curves
                if len(original_samples) == len(bezier_samples):
                    error_sum = 0
                    for (bx, by), (ox, oy) in zip(bezier_samples, original_samples):
                        error_sum += (bx - ox)**2 + (by - oy)**2
                    rms_error = math.sqrt(error_sum / len(bezier_samples))
                    
                    # Calculate arc length for percentage
                    arc_length = 0
                    for j in range(len(original_samples) - 1):
                        dx = original_samples[j+1][0] - original_samples[j][0]
                        dy = original_samples[j+1][1] - original_samples[j][1]
                        arc_length += math.sqrt(dx*dx + dy*dy)
                    
                    error_percentage = (rms_error / arc_length * 100) if arc_length > 0 else 0
                    
                    total_error += rms_error
                    validation_count += 1
                    
                    print(f"  {ring_name}: RMS error = {rms_error:.1f}px ({error_percentage:.1f}% of arc)")
    
    if validation_count > 0:
        avg_error = total_error / validation_count
        print(f"  Average RMS error: {avg_error:.1f} pixels")
        print(f"  Validated {validation_count} curves across {len(ring_validation_count)} rings")
    else:
        print(f"  ⚠️  Could not validate curves (insufficient data)")

def create_arc_optimized_svg(blocks, output_file):
    """Create SVG using circular arcs for maximum accuracy"""
    svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160.17 861.54">
  <defs>
    <style>
      .inner-block {
        fill: none;
        stroke: #0066cc;
        stroke-width: 0.8;
        opacity: 0.8;
      }
      .outer-block {
        fill: none;
        stroke: #cc6600;
        stroke-width: 0.8;
        opacity: 0.8;
      }
      .inner-exception {
        fill: none;
        stroke: #cc0066;
        stroke-width: 1.0;
        opacity: 0.9;
      }
      .inner-block:hover, .outer-block:hover, .inner-exception:hover {
        fill: rgba(255, 0, 0, 0.1);
        stroke-width: 1.5;
        opacity: 1;
      }
    </style>
  </defs>
  <g id="BRC_Arc_Blocks">
'''
    
    arc_count = 0
    total_points = 0
    
    for block in blocks:
        # Try new arc data first, then polyline exception, then fallback to bezier data
        arc_data = block.get('arc_data')
        polyline_data = block.get('polyline_data')
        bezier_data = block.get('bezier_data')
        
        if polyline_data and 'polygon_points' in polyline_data:
            # Handle new exception blocks with custom polygon points
            polygon_points = polyline_data['polygon_points']
            
            if polygon_points:
                d = f"M {polygon_points[0][0]:.1f},{polygon_points[0][1]:.1f}"
                for x, y in polygon_points[1:]:
                    d += f" L {x:.1f},{y:.1f}"
                d += " Z"
                
                arc_count += 1
                total_points += len(polygon_points)
        
        elif polyline_data and 'inner_polyline' in polyline_data and 'outer_arc' in polyline_data:
            # Handle old Esplanade exception blocks with 50-point polylines
            inner_polyline = polyline_data['inner_polyline']
            outer_arc = polyline_data['outer_arc']
            radial1 = polyline_data['radial1'] 
            radial2 = polyline_data['radial2']
            
            # Create path with polyline for inner boundary
            if inner_polyline:
                d = f"M {inner_polyline[0][0]:.1f},{inner_polyline[0][1]:.1f}"
                for x, y in inner_polyline[1:]:
                    d += f" L {x:.1f},{y:.1f}"
                
                # First radial line to outer ring
                d += f" L {radial2[1][0]:.1f},{radial2[1][1]:.1f}"
                
                # Outer arc (reversed direction)
                outer_start = outer_arc['end_point']
                outer_end = outer_arc['start_point'] 
                outer_radius = outer_arc['radius']
                outer_sweep = 1 - outer_arc['sweep_flag']
                d += f" A {outer_radius:.1f},{outer_radius:.1f} 0 {outer_arc['large_arc_flag']},{outer_sweep} {outer_end[0]:.1f},{outer_end[1]:.1f}"
                
                # Z closes back to start (second radial)
                d += " Z"
                
                arc_count += 1
                total_points += len(inner_polyline) + 2  # polyline points + 2 radial endpoints
            
        elif arc_data and 'inner_arc' in arc_data and 'outer_arc' in arc_data:
            inner_arc = arc_data['inner_arc']
            outer_arc = arc_data['outer_arc']
            radial1 = arc_data['radial1'] 
            radial2 = arc_data['radial2']
            
            # Create path with proper 4-sided structure using circular arcs
            # Start at inner arc start point
            start_point = inner_arc['start_point']
            d = f"M {start_point[0]:.1f},{start_point[1]:.1f}"
            
            # Inner arc (side 1)
            end_point = inner_arc['end_point']
            radius = inner_arc['radius']
            large_arc = inner_arc['large_arc_flag']
            sweep = inner_arc['sweep_flag']
            d += f" A {radius:.1f},{radius:.1f} 0 {large_arc},{sweep} {end_point[0]:.1f},{end_point[1]:.1f}"
            
            # First radial line (side 2) 
            d += f" L {radial2[1][0]:.1f},{radial2[1][1]:.1f}"
            
            # Outer arc (side 3) - reversed direction
            outer_start = outer_arc['end_point']  # Start from end (reverse)
            outer_end = outer_arc['start_point']  # End at start (reverse)
            outer_radius = outer_arc['radius']
            # Reverse the sweep direction for the outer arc
            outer_sweep = 1 - outer_arc['sweep_flag']
            d += f" A {outer_radius:.1f},{outer_radius:.1f} 0 {outer_arc['large_arc_flag']},{outer_sweep} {outer_end[0]:.1f},{outer_end[1]:.1f}"
            
            # Z command automatically draws the second radial line back to start
            d += " Z"  # Close path (second radial line: side 4)
            
            arc_count += 1
            total_points += 4  # 2 arc endpoints + 2 radial endpoints
            
        elif bezier_data and 'inner_arc' in bezier_data and 'outer_arc' in bezier_data:
            # Fallback to Bezier for old data
            inner_arc = bezier_data['inner_arc']
            outer_arc = bezier_data['outer_arc']
            radial1 = bezier_data['radial1'] 
            radial2 = bezier_data['radial2']
            
            if len(inner_arc) >= 4 and len(outer_arc) >= 4:
                d = cubic_bezier_to_svg_path(inner_arc)  # Inner arc (side 1)
                d += f" L {radial2[1][0]:.1f},{radial2[1][1]:.1f}"  # First radial line (side 2)
                
                # Outer arc (reversed)
                outer_reversed = list(reversed(outer_arc))
                outer_path = cubic_bezier_to_svg_path(outer_reversed)
                d += " " + outer_path[2:]  # Outer arc (side 3) - Remove "M " from start
                
                d += " Z"  # Close path (second radial line: side 4)
                
                arc_count += 1
                total_points += 8
            else:
                # Fallback for incomplete data
                coords = block.get('curved_points', [])
                if coords:
                    d = f"M {coords[0][0]:.1f},{coords[0][1]:.1f}"
                    for x, y in coords[1:]:
                        d += f" L {x:.1f},{y:.1f}"
                    d += " Z"
                    total_points += len(coords)
        else:
            # Fallback to polygon points
            coords = block.get('curved_points', [])
            if coords:
                d = f"M {coords[0][0]:.1f},{coords[0][1]:.1f}"
                for x, y in coords[1:]:
                    d += f" L {x:.1f},{y:.1f}"
                d += " Z"
                total_points += len(coords)
        
        css_class = f"{block['type']}-block"
        svg_content += f'    <path id="{block["id"]}" class="{css_class}" d="{d}" />\n'
    
    svg_content += '''  </g>
</svg>'''
    
    with open(output_file, 'w') as f:
        f.write(svg_content)
    
    print(f"\n🎨 Arc SVG Optimization:")
    print(f"  File: {output_file}")
    print(f"  Polygons using circular arcs: {arc_count}/{len(blocks)} ({100*arc_count/len(blocks):.1f}%)")
    print(f"  Total points used: {total_points}")
    print(f"  Average points per polygon: {total_points/len(blocks):.1f}")
    print(f"  Reduction vs standard: {100*(1 - total_points/(len(blocks)*12)):.1f}% fewer points")
    
    return output_file

def main():
    input_file = "your_input_manual_edits.svg"
    combined_file = "brc_combined_validation.svg"
    
    print("🎯 CLEAN BRC POLYGONIZER")
    print("=" * 60)
    print("Creating 96 inner + 160 outer = 256 total blocks")
    print("=" * 60)
    
    # Extract roads
    rings, radials = extract_roads_from_manual_svg(input_file)
    
    # Create blocks
    blocks = create_brc_blocks(rings, radials)
    
    # Create outputs
    combined_svg = create_combined_svg(input_file, blocks, combined_file)
    
    # Create Arc-optimized version
    arc_file = "brc_arc_polygons.svg"
    arc_svg = create_arc_optimized_svg(blocks, arc_file)
    
    # Validate arc curves against original input
    validate_bezier_against_original(blocks, rings)
    
    # Statistics
    inner_count = len([b for b in blocks if b['type'].startswith('inner')])
    outer_count = len([b for b in blocks if b['type'] == 'outer'])
    exception_count = len([b for b in blocks if b['type'] == 'inner_exception'])
    
    print("\n" + "=" * 60)
    print(f"✅ SUCCESS! Created {len(blocks)} blocks")
    print(f"📁 Combined validation: {combined_svg}")
    print(f"📁 Arc optimized: {arc_svg}")
    print(f"\n📊 Distribution:")
    print(f"   Inner blocks: {inner_count}")
    print(f"   Outer blocks: {outer_count}")
    print(f"   Exception blocks: {exception_count}")
    print(f"   Total: {len(blocks)}")
    print(f"   Target: 256")
    print(f"   Progress: {100 * len(blocks) / 256:.1f}%")

if __name__ == "__main__":
    main()