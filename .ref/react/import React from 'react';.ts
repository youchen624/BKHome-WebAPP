import React from 'react';
import { FeatureItem } from '../types';

// 定義元件接收的參數型別
interface FeatureCardProps {
  item: FeatureItem;
  onSelect: (id: string) => void; // 定義一個點擊事件的函式型別
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ item, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(item.id)}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        marginBottom: '12px'
      }}
    >
      <span style={{ fontSize: '12px', color: '#0070f3', fontWeight: 'bold' }}>
        {item.tag}
      </span>
      <h3>{item.title}</h3>
      <p style={{ color: '#555' }}>{item.description}</p>
    </div>
  );
};