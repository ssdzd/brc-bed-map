import React from 'react';
import { parseBlockId, campInBlock } from '../utils/blockUtils';

const InfoPanel = ({ blockId, camps, onClose }) => {
  const { street, approximateTime } = parseBlockId(blockId);
  const campsInBlock = camps.filter(camp => 
    campInBlock(camp.placement_address, blockId)
  );

  return (
    <div className="absolute top-4 right-4 bg-white p-6 rounded-lg shadow-xl max-w-sm z-20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">Block {blockId}</h3>
          <p className="text-sm text-gray-600">
            Street {street} near {approximateTime}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      {campsInBlock.length > 0 ? (
        <div>
          <p className="text-sm font-medium mb-2">
            {campsInBlock.length} camp{campsInBlock.length > 1 ? 's' : ''} in this block:
          </p>
          <ul className="space-y-2">
            {campsInBlock.map(camp => (
              <li key={camp.id} className="border-l-4 pl-3 py-1" 
                  style={{ borderColor: getBEDColor(camp.bed_status) }}>
                <div className="font-medium text-sm">{camp.camp_name}</div>
                <div className="text-xs text-gray-600">
                  {camp.placement_address} • {formatStatus(camp.bed_status)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No camps registered in this block</p>
      )}
    </div>
  );
};

const getBEDColor = (status) => {
  const colors = {
    none: '#9CA3AF',
    video_complete: '#FDE047',
    buddy_assigned: '#FB923C',
    fully_implemented: '#4ADE80'
  };
  return colors[status] || colors.none;
};

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default InfoPanel; 