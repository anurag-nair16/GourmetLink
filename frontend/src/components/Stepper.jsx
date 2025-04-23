import React from 'react';
import { FaCamera, FaList, FaSliders, FaUtensils } from 'react-icons/fa';

const Stepper = ({ currentStep }) => {
  const steps = [
    { icon: FaCamera, title: 'Upload Photo' },
    { icon: FaList, title: 'Confirm Ingredients' },
    { icon: FaSliders, title: 'Set Preferences' },
    { icon: FaUtensils, title: 'View Recipe' },
  ];

  return (
    <div className="w-full py-6 px-4 bg-white shadow-md rounded-lg mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index <= currentStep
                  ? 'bg-primary-main text-white'
                  : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              <step.icon />
            </div>
            <div
              className={`mt-2 text-sm ${
                index <= currentStep ? 'text-primary-main' : 'text-neutral-400'
              }`}
            >
              {step.title}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 left-[50px] w-[calc(100vw/5)] h-0.5 -z-10 ${
                  index < currentStep ? 'bg-primary-main' : 'bg-neutral-100'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;