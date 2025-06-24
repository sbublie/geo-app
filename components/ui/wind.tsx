export default function WindArrow({ direction, size = 48 }: { direction: number; size?: number }) {

    return (
        <div className="flex items-center justify-center">
            <div 
                className="relative"
                style={{ width: size, height: size }}
            >
                {/* Outer circle with gradient */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200/50 shadow-sm"></div>
                
                {/* Wind direction arrow */}
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 48 48"
                    className="absolute"
                    style={{ transform: `rotate(${direction}deg)` }}
                >
                    <defs>
                        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                        <marker
                            id="modernArrowhead"
                            markerWidth="12"
                            markerHeight="8"
                            refX="10"
                            refY="4"
                            orient="auto"
                        >
                            <polygon
                                points="0 0, 12 4, 0 8"
                                fill="url(#arrowGradient)"
                                className="drop-shadow-sm"
                            />
                        </marker>
                    </defs>
                    
                    {/* Main arrow line */}
                    <line
                        x1="24"
                        y1="36"
                        x2="24"
                        y2="12"
                        stroke="url(#arrowGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        markerEnd="url(#modernArrowhead)"
                        className="drop-shadow-sm"
                    />
                </svg>
                

                

            </div>
        </div>
    );
}