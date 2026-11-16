const nodes = [
  [80, 170],
  [245, 75],
  [285, 245],
  [435, 150],
  [530, 335],
  [645, 70],
  [735, 225],
  [850, 120],
  [940, 340],
  [1090, 205],
  [1190, 80],
];
const edges = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 4],
  [3, 5],
  [3, 6],
  [4, 6],
  [5, 6],
  [5, 7],
  [6, 7],
  [6, 8],
  [7, 9],
  [7, 10],
  [8, 9],
  [9, 10],
];

export function NeuralBackground() {
  return (
    <div className="neural-background" aria-hidden="true">
      <div className="neural-wash" />
      <svg viewBox="0 0 1280 420" preserveAspectRatio="xMidYMid slice">
        <g className="neural-links">
          {edges.map(([from, to], i) => (
            <path
              key={i}
              d={`M${nodes[from][0]},${nodes[from][1]} L${nodes[to][0]},${nodes[to][1]}`}
              style={{ animationDelay: `${i * -0.7}s` }}
            />
          ))}
        </g>
        {nodes.map(([x, y], i) => (
          <g
            key={i}
            className="neural-node"
            style={{ animationDelay: `${i * -0.9}s` }}
          >
            <circle cx={x} cy={y} r="3" />
            <circle
              cx={x}
              cy={y}
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth=".5"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
