import React, { Component } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";
import "./PathfindingVisualizer.css";

export default class PathfindingVisualizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
      mouseIsPressed: false,
      clickCount: 0,
      startNode: null,
      finishNode: null,
      visualizationComplete: false,
      showPopup: false, // state to control the pop-up visibility
    };
  }

  componentDidMount() {
    const initialGrid = getInitialGrid();
    this.setState({ grid: initialGrid });
  }

  handleMouseDown(row, col) {
    const { clickCount, visualizationComplete } = this.state;
    if (visualizationComplete) return;

    if (clickCount === 0) {
      const newGrid = this.setStartNode(row, col);
      this.setState({
        grid: newGrid,
        startNode: { row, col },
        clickCount: 1,
      });
    } else if (clickCount === 1) {
      const newGrid = this.setFinishNode(row, col);
      this.setState({
        grid: newGrid,
        finishNode: { row, col },
        clickCount: 2,
      });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleMouseEnter(row, col) {
    if (
      !this.state.mouseIsPressed ||
      this.state.clickCount < 2 ||
      this.state.visualizationComplete
    )
      return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  setStartNode(row, col) {
    const newGrid = this.state.grid.slice();
    newGrid[row][col] = {
      ...newGrid[row][col],
      isStart: true,
      distance: 0,
    };
    return newGrid;
  }

  setFinishNode(row, col) {
    const newGrid = this.state.grid.slice();
    newGrid[row][col] = {
      ...newGrid[row][col],
      isFinish: true,
    };
    return newGrid;
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!node.isStart && !node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited";
        }
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    if (!Array.isArray(nodesInShortestPathOrder)) return;
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (!node.isStart && !node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-shortest-path";
        }
        if (i === nodesInShortestPathOrder.length - 1) {
          this.setState({ visualizationComplete: true });
        }
      }, 25 * i);
    }
  }

  visualizeDijkstra() {
    const { grid, startNode, finishNode } = this.state;
    if (!startNode || !finishNode) {
      alert("Please select both start and finish nodes first.");
      return;
    }
    const start = grid[startNode.row][startNode.col];
    const finish = grid[finishNode.row][finishNode.col];
    const visitedNodesInOrder = dijkstra(grid, start, finish);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finish);

    // Check if there is no path found (empty or undefined array)
    if (!nodesInShortestPathOrder || nodesInShortestPathOrder.length === 0) {
      this.setState({ showPopup: true }); // Show the pop-up if no path is found
      return;
    }

    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  resetGrid() {
    const newGrid = this.state.grid.map((row) =>
      row.map((node) => ({
        ...node,
        isWall: false,
        isVisited: false,
        isStart: false,
        isFinish: false,
        distance: Infinity,
        previousNode: null,
      }))
    );

    // Reset node styles
    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[0].length; col++) {
        const nodeElement = document.getElementById(`node-${row}-${col}`);
        if (nodeElement) {
          nodeElement.className = "node";
        }
      }
    }

    // Reset state values
    this.setState({
      grid: newGrid,
      mouseIsPressed: false,
      clickCount: 0,
      startNode: null,
      finishNode: null,
      visualizationComplete: false,
      showPopup: false, // Close the popup when reset
    });
  }

  render() {
    const { grid, mouseIsPressed, visualizationComplete, showPopup } =
      this.state;
    return (
      <>
        <header>Pathfinding Visualizer</header>
        <div className="controls">
          <button className="btn" onClick={() => this.visualizeDijkstra()}>
            Visualize Dijkstra's Algorithm
          </button>
          {visualizationComplete && (
            <button className="btn reset" onClick={() => this.resetGrid()}>
              Reset
            </button>
          )}
        </div>
        <div className="description"> Select node as
          <p> 
            <span className="node node-start" /> <strong>Green:</strong> Source
            Node &nbsp;&nbsp;
            <span className="node node-finish" /> <strong>Red:</strong>{" "}
            Destination Node &nbsp;&nbsp;
            <span className="node node-wall" /> <strong>Black:</strong> Barrier
            Node
          </p>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="grid-row">
              {row.map((node, nodeIdx) => {
                const { row, col, isFinish, isStart, isWall } = node;
                return (
                  <Node
                    key={nodeIdx}
                    col={col}
                    row={row}
                    isFinish={isFinish}
                    isStart={isStart}
                    isWall={isWall}
                    mouseIsPressed={mouseIsPressed}
                    onMouseDown={(r, c) => this.handleMouseDown(r, c)}
                    onMouseEnter={(r, c) => this.handleMouseEnter(r, c)}
                    onMouseUp={() => this.handleMouseUp()}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <footer>&copy; 2025 Pathfinding Visualizer</footer>

        {/* Pop-up Window */}
        {showPopup && (
          <div className="popup">
            <div className="popup-content">
              <h2>No Path Found!</h2>
              <p>Sorry, there is no path between the start and finish nodes.</p>
              <button onClick={() => this.resetGrid()} className="reset-btn">
                Reset
              </button>
            </div>
          </div>
        )}
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 15; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: false,
    isFinish: false,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
