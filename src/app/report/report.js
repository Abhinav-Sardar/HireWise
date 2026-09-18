export default function ReportPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Performance Report</h2>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-[#1A1D27] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-[#8B5CF6] flex items-center justify-center text-3xl font-bold mb-4">
            82%
          </div>
          <p className="text-[#9CA3AF] text-sm">Overall Score</p>
        </div>

        <div className="col-span-2 bg-[#1A1D27] border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Performance Breakdown</h3>
          <div className="space-y-4">
            <ProgressBar label="Technical Knowledge" percentage={86} />
            <ProgressBar label="Communication" percentage={76} />
            <ProgressBar label="System Design" percentage={88} />
          </div>
        </div>
      </div>

      <div className="bg-[#1A1D27] border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold mb-2">Recommended Focus</h3>
        <p className="text-[#9CA3AF] text-sm leading-relaxed">
          Your technical depth is strong, specifically in database architecture.
          However, eye-gaze consistency dropped during complex problem-solving.
          Practice looking directly at the camera. Additionally, your speaking
          pace increased to 150 wpm during the system design phase. Pause
          briefly before answering difficult questions to reduce filler words
          (17 detected in the last session).
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ label, percentage }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-[#0F111A] rounded-full h-2">
        <div
          className="bg-[#8B5CF6] h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
