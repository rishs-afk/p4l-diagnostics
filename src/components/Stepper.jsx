export default function Stepper({ currentStep, steps }) {
  const stepLabels = { scan: 'Scan', verify: 'Verify', summary: 'Summary' };
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center gap-1" id="stepper-bar">
      {steps.map((step, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;

        return (
          <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isDone ? 'bg-emerald-500 w-full' : isActive ? 'bg-p4l-red w-full' : 'w-0'
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 ${
                isActive ? 'text-p4l-red' : isDone ? 'text-emerald-600' : 'text-slate-300'
              }`}
            >
              {stepLabels[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
