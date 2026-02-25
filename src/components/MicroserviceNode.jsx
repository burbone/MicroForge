import { h } from 'preact';
import { Handle, Position } from 'reactflow';
import { MICROSERVICES } from '../config';

export default function MicroserviceNode({ data, id }) {
  const service = MICROSERVICES[id];
  if (!service) return null;
  
  return (
    <div className="microservice-cloud" style={{ width: '180px', height: '100px', position: 'relative' }}>
      <Handle type="target" position={Position.Left} />
      
      <svg 
        className="cloud-svg" 
        viewBox="0 0 180 100" 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <path 
          d="M 25,60 Q 10,60 10,45 Q 10,30 25,30 Q 30,10 50,10 Q 70,10 75,30 Q 90,25 100,35 Q 115,40 110,55 Q 110,70 95,70 L 25,70 Z" 
          fill="#2a2a2a" 
          stroke="#7b3ff2" 
          strokeWidth="2"
        />
      </svg>
      
      <div 
        className="cloud-content" 
        style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          width: '80%',
          pointerEvents: 'none'
        }}
      >
        <span className="cloud-name" style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>
          {service.name}
        </span>
      </div>
    </div>
  );
}