import { TrainLine, PowerLine } from "@/lib/osmApi";

export function TrainLineDetails({ trainLine, onClose }: { trainLine: TrainLine; onClose: () => void }) {
    return (
        <div className="bg-white bg-opacity-95 p-4 rounded-lg shadow-lg border max-w-[350px] max-h-[400px] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-700">
                    {trainLine.properties.name || 'Unnamed Railway'}
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                    ×
                </button>
            </div>

            <div className="space-y-2">
                <div className="text-sm">
                    <span className="font-semibold">Type:</span> {trainLine.properties.railway}
                </div>

                {/* Display service information prominently if available */}
                {trainLine.properties.service && (
                    <div className="text-sm bg-blue-50 p-2 rounded">
                        <span className="font-semibold text-blue-800">🚂 Service:</span>{' '}
                        <span className="text-blue-700 font-bold">{trainLine.properties.service}</span>
                    </div>
                )}

                {/* Display electrification status if available */}
                {trainLine.properties.electrified && (
                    <div className="text-sm bg-green-50 p-2 rounded">
                        <span className="font-semibold text-green-800">⚡ Electrified:</span>{' '}
                        <span className="text-green-700 font-bold">{trainLine.properties.electrified}</span>
                    </div>
                )}

                {/* Display max speed if available */}
                {trainLine.properties.maxspeed && (
                    <div className="text-sm bg-orange-50 p-2 rounded">
                        <span className="font-semibold text-orange-800">🏃 Max Speed:</span>{' '}
                        <span className="text-orange-700 font-bold">{trainLine.properties.maxspeed}</span>
                    </div>
                )}

                {/* Display all other properties */}
                {Object.entries(trainLine.properties).map(([key, value]) => {
                    if (['railway', 'service', 'electrified', 'maxspeed'].includes(key) || !value) return null;
                    return (
                        <div key={key} className="text-sm">
                            <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                            <span className="text-gray-600">{String(value)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function PowerLineDetails({ powerLine, onClose }: { powerLine: PowerLine; onClose: () => void }) {
    return (
    <div className="bg-white bg-opacity-95 p-4 rounded-lg shadow-lg border max-w-[350px] max-h-[400px] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">
          {powerLine.properties.name || 'Unnamed Power Line'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-sm">
          <span className="font-semibold">Type:</span> {powerLine.properties.power}
        </div>

        {/* Display voltage prominently if available */}
        {powerLine.properties.voltage && (
          <div className="text-sm bg-yellow-50 p-2 rounded">
            <span className="font-semibold text-yellow-800">⚡ Voltage:</span>{' '}
            <span className="text-yellow-700 font-bold">{powerLine.properties.voltage}</span>
          </div>
        )}

        {/* Display all other properties */}
        {Object.entries(powerLine.properties).map(([key, value]) => {
          if (key === 'power' || key === 'voltage' || !value) return null;
          return (
            <div key={key} className="text-sm">
              <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
              <span className="text-gray-600">{String(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}