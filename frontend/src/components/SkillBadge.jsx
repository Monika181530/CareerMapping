import React from 'react';

const SkillBadge = ({ skillName, classification }) => {
  let badgeClass = 'badge ';
  switch (classification) {
    case 'Strong':
      badgeClass += 'badge-green';
      break;
    case 'Needs Improvement':
      badgeClass += 'badge-yellow';
      break;
    case 'Major Gap':
      badgeClass += 'badge-red';
      break;
    case 'Missing':
      badgeClass += 'badge-red'; // could use a darker red if defined
      break;
    default:
      badgeClass += 'badge-blue';
  }

  return (
    <span className={badgeClass} style={{ margin: '4px' }}>
      {skillName}
    </span>
  );
};

export default SkillBadge;
