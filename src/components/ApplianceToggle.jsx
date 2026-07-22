export default function ApplianceToggle({ label, icon: Icon, on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all ${
        on ? 'border-primary bg-primary-50' : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            on ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className={`font-medium ${on ? 'text-primary-700' : 'text-gray-600'}`}>{label}</span>
      </div>
      <div
        className={`relative w-12 h-6 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-gray-300'}`}
      >
        <div
          className={`toggle-knob absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow ${
            on ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
}
