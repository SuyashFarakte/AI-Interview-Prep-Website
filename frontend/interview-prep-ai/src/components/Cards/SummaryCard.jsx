import React from 'react';
import { getInitials } from '../../utils/helper'; // adjust the path if needed


const SummaryCard = ({
  colors,
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      className='bg-white border border-gray-300/40 rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow'
      onClick={onSelect}
    >
      <div
        className='rounded p-4 sm:p-5 relative'
          style={{
    background: colors?.background || '#fff5e1', // fallback to champagne if no color passed
  }}

      >
        <div className='flex items-start capitalize'>
          <div className='flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-md flex items-center justify-center mr-3 sm:mr-4'>
            <span className='text-base sm:text-lg font-semibold text-black'>
             {getInitials(role) || 'GU'}
             </span>
          </div>

          {/* Content Container */}
          <div className='flex-grow min-w-0'>
            <div className='flex justify-between items-start'>
              <div className='flex-1 min-w-0 pr-2'>
                <h2 className='text-base sm:text-lg md:text-[20px] font-medium truncate'>{role}</h2>
                <p className='text-sm sm:text-base md:text-[17px] text-medium text-gray-900 line-clamp-2'>
                  {topicsToFocus}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          className='hidden group-hover:flex items-center gap-2 text-xs text-rose-500 font-medium bg-rose-50 px-2 sm:px-3 py-1 rounded text-nowrap border border-rose-100 hover:border-rose-200 cursor-pointer absolute top-2 sm:top-3 right-2 sm:right-3'
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </button>
      </div>

      <div className='px-3 pb-3'>
        <div className='flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4'>
          <div className='text-[10px] sm:text-[12px] font-medium text-black px-2 sm:px-3 py-1 border-[0.25px] border-gray-900 rounded-full whitespace-nowrap'>
            Experience: {experience} {experience == 1 ? 'Year' : 'Years'}
          </div>
          <div className='text-[10px] sm:text-[12px] font-medium text-black px-2 sm:px-3 py-1 border-[0.25px] border-gray-900 rounded-full whitespace-nowrap'>
            {questions} Q&A
          </div>
          <div className='text-[10px] sm:text-[12px] font-medium text-black px-2 sm:px-3 py-1 border-[0.25px] border-gray-900 rounded-full whitespace-nowrap'>
            Last Updated: {lastUpdated}
          </div>
        </div>

        {/* Description */}
        <p className='text-xs sm:text-sm md:text-[14px] text-gray-500 font-medium line-clamp-2 mt-3 sm:mt-4'>
          {description}
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;
