export default function WindArrow(direction: number) {
    return (
        <div className="flex items-center justify-center">
            <div className="relative w-12 h-12">
                <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    className="absolute"
                    style={{ transform: `rotate(${direction}deg)` }}
                >
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon
                                points="0 0, 10 3.5, 0 7"
                                fill="#1f2937"
                            />
                        </marker>
                    </defs>
                    <line
                        x1="24"
                        y1="40"
                        x2="24"
                        y2="8"
                        stroke="#1f2937"
                        strokeWidth="3"
                        markerEnd="url(#arrowhead)"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
            </div>
        </div>
    );

}