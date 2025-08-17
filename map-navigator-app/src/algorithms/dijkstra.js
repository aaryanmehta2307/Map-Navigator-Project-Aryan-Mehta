export function dijkstra(grid, startNode, finishNode) {
    const visitedNodeInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid);
    while (!!unvisitedNodes.length) {
        sortNodesByDistance(unvisitedNodes);

        const closestNode = unvisitedNodes.shift();

        if (closestNode.isWall) continue;

        if (closestNode.distance === Infinity) return visitedNodeInOrder;
        closestNode.isVisited = true;
        visitedNodeInOrder.push(closestNode);
        if (closestNode === finishNode) return visitedNodeInOrder;
        updateUnvisitedNeighbors(closestNode, grid);
    }
}
function sortNodesByDistance(unvisitedNodes){
    unvisitedNodes.sort((nodeA,nodeB)=>nodeA.distance-nodeB.distance);
}
function updateUnvisitedNeighbors(node, grid) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
        // If moving diagonally, cost is √2; else cost is 1
        const isDiagonal = node.row !== neighbor.row && node.col !== neighbor.col;
        const distance = node.distance + (isDiagonal ? Math.SQRT2 : 1);

        if (distance < neighbor.distance) {   // ✅ important check
            neighbor.distance = distance;
            neighbor.previousNode = node;
        }
    }
}


function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;

    // 4-directional
    if (row > 0) neighbors.push(grid[row - 1][col]);        // Up
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]); // Down
    if (col > 0) neighbors.push(grid[row][col - 1]);        // Left
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]); // Right

    // ✅ 4 diagonal directions
    if (row > 0 && col > 0) neighbors.push(grid[row - 1][col - 1]);          // Top-left
    if (row > 0 && col < grid[0].length - 1) neighbors.push(grid[row - 1][col + 1]); // Top-right
    if (row < grid.length - 1 && col > 0) neighbors.push(grid[row + 1][col - 1]);    // Bottom-left
    if (row < grid.length - 1 && col < grid[0].length - 1) neighbors.push(grid[row + 1][col + 1]); // Bottom-right

    return neighbors.filter(neighbor => !neighbor.isVisited);
}


function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
        for (const node of row) {
            nodes.push(node);
        }
    }
    return nodes;
}

export function getNodesInShortestPathOrder(finishNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode;
    while (currentNode !== null) {
        nodesInShortestPathOrder.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
}
                                                         