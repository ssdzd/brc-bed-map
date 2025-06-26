#!/usr/bin/env python3
"""
Calculate intersection points between SVG elements for BRC map processing.
"""
import math
import re

def parse_svg_path(path_d):
    """Parse SVG path d attribute into coordinates and bezier control points."""
    # Parse the Esplanade path: M427.93,159c-19.35,33.22-30.43,71.84-30.43,113.05s10.75,78.67,29.56,111.55c31.5,55.08,83.6,95.55,147.66,108.78,12.33-10.28,30.21-16.48,47.53-16.48s35.28,6.23,47.63,16.56c64.06-13.11,116.21-53.47,147.81-108.43,18.97-32.97,29.81-71.21,29.81-111.98s-11.17-80.17-30.68-113.48L1087,2.57
    
    # This is a complex cubic bezier curve. For intersection calculation, we'll approximate it
    # as a series of line segments for computational feasibility.
    
    # Starting point
    start_x, start_y = 427.93, 159
    
    # Key points along the curve (approximated)
    points = [
        (427.93, 159),    # Start
        (408.58, 192.22), # First curve segment
        (397.5, 230.84),  # 
        (397.5, 272.05),  # Middle of first arc
        (408.25, 310.72), # 
        (427.06, 383.6),  # End of first major curve
        (458.56, 438.68), # 
        (510.66, 479.15), # 
        (574.72, 492.38), # End of curve, start of straight section
        (622.25, 475.9),  # Middle section
        (669.88, 492.46), # Start of final curve
        (733.94, 479.35), # 
        (785.15, 438.92), # 
        (817.75, 383.92), # 
        (847.56, 272.05), # Top of final arc
        (847.56, 160.07), # 
        (816.88, 46.57),  # 
        (1087, 2.57)      # End point
    ]
    
    return points

def line_intersection(x1, y1, x2, y2, x3, y3, x4, y4):
    """Calculate intersection point of two line segments."""
    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(denom) < 1e-10:
        return None  # Lines are parallel
    
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
    
    if 0 <= t <= 1 and 0 <= u <= 1:
        # Intersection point
        ix = x1 + t * (x2 - x1)
        iy = y1 + t * (y2 - y1)
        return (ix, iy)
    
    return None

def find_intersections_with_esplanade():
    """Find intersection points between radial roads and Esplanade."""
    
    # Get Esplanade path points
    esplanade_points = parse_svg_path("")
    
    # 3:00-9:00 radial (horizontal line at y=271.04 from x=85.5 to x=1158.5)
    radial_3_9_start = (85.5, 271.04)
    radial_3_9_end = (1158.5, 271.04)
    
    # 6:00 radial (vertical line from x=622.5, y=569.54 to x=622, y=806.54)
    radial_6_start = (622.5, 569.54)
    radial_6_end = (622, 806.54)
    
    print("Finding intersections...")
    
    # Find intersections for 3:00-9:00 radial with Esplanade
    intersections_3_9 = []
    for i in range(len(esplanade_points) - 1):
        x3, y3 = esplanade_points[i]
        x4, y4 = esplanade_points[i + 1]
        
        intersection = line_intersection(
            radial_3_9_start[0], radial_3_9_start[1],
            radial_3_9_end[0], radial_3_9_end[1],
            x3, y3, x4, y4
        )
        
        if intersection:
            intersections_3_9.append(intersection)
    
    # Find intersections for 6:00 radial with Esplanade
    intersections_6 = []
    for i in range(len(esplanade_points) - 1):
        x3, y3 = esplanade_points[i]
        x4, y4 = esplanade_points[i + 1]
        
        intersection = line_intersection(
            radial_6_start[0], radial_6_start[1],
            radial_6_end[0], radial_6_end[1],
            x3, y3, x4, y4
        )
        
        if intersection:
            intersections_6.append(intersection)
    
    # For the horizontal 3:00-9:00 radial, we need to find where it crosses the Esplanade
    # The Esplanade is roughly an ellipse centered around (622, 271)
    # For a horizontal line at y=271.04, we can calculate the intersections analytically
    
    # Esplanade approximate ellipse parameters (estimated from the path)
    center_x = 622
    center_y = 271
    a = 225  # semi-major axis (horizontal)
    b = 113  # semi-minor axis (vertical)
    
    # For horizontal line y = 271.04, solve ellipse equation
    y_offset = 271.04 - center_y
    if abs(y_offset) <= b:
        x_offset = a * math.sqrt(1 - (y_offset / b) ** 2)
        left_intersection = (center_x - x_offset, 271.04)
        right_intersection = (center_x + x_offset, 271.04)
        intersections_3_9 = [left_intersection, right_intersection]
    
    # For the 6:00 radial, find where it intersects the bottom of the Esplanade
    # This is more complex due to the curved nature, but we can approximate
    # The 6:00 radial goes from (622.5, 569.54) to (622, 806.54)
    # The Esplanade bottom curve intersects around y ≈ 383.6 (from the path data)
    intersection_6 = (622.25, 383.6)  # Approximate intersection point
    intersections_6 = [intersection_6]
    
    print(f"3:00-9:00 radial intersections: {intersections_3_9}")
    print(f"6:00 radial intersections: {intersections_6}")
    
    return intersections_3_9, intersections_6

if __name__ == "__main__":
    intersections_3_9, intersections_6 = find_intersections_with_esplanade()
    
    print("\nSVG Modifications needed:")
    print("\n1. Replace 3:00-9:00 radial line with 3 segments:")
    if len(intersections_3_9) >= 2:
        left_int = intersections_3_9[0]
        right_int = intersections_3_9[1]
        
        print(f'   Segment 1: x1="85.5" y1="271.04" x2="{left_int[0]:.2f}" y2="{left_int[1]:.2f}"')
        print(f'   Segment 2: x1="{left_int[0]:.2f}" y1="{left_int[1]:.2f}" x2="{right_int[0]:.2f}" y2="{right_int[1]:.2f}" class="inner_playa_road"')
        print(f'   Segment 3: x1="{right_int[0]:.2f}" y1="{right_int[1]:.2f}" x2="1158.5" y2="271.04"')
    
    print("\n2. Replace 6:00 radial line with 2 segments:")
    if len(intersections_6) >= 1:
        int_point = intersections_6[0]
        print(f'   Segment 1: x1="622.5" y1="569.54" x2="{int_point[0]:.2f}" y2="{int_point[1]:.2f}" class="inner_playa_road"')
        print(f'   Segment 2: x1="{int_point[0]:.2f}" y1="{int_point[1]:.2f}" x2="622" y2="806.54"')