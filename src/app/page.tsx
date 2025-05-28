'use client';

import React, { useState, useCallback, useEffect } from 'react';
import CanvasWrapper from '@/components/CanvasWrapper';
import { DiagramNode } from '@/types/nodes';
import { Edge, EdgeCreationMode, EdgeCreationState } from '@/types/edges';
import { NodeFactory } from '@/lib/NodeFactory';
import { EdgeFactory } from '@/lib/EdgeFactory';

export default function Home() {
  const [nodes, setNodes] = useState<DiagramNode[]>(() => [
    // Sample nodes to demonstrate functionality
    NodeFactory.createTextNode(200, 100, 'Hello World!'),
    NodeFactory.createRectangleNode(400, 150, 120, 80),
    NodeFactory.createCircleNode(600, 200, 40),
    NodeFactory.createTextNode(100, 300, 'Drag me around!'),
    NodeFactory.createRectangleNode(300, 350, 100, 50),
    NodeFactory.createCircleNode(500, 400, 35),
  ]);

  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [edgeCreationMode, setEdgeCreationMode] = useState<EdgeCreationMode>('none');
  const [edgeCreationState, setEdgeCreationState] = useState<EdgeCreationState>({
    isCreating: false,
    sourceNodeId: null,
    targetNodeId: null,
    tempEdge: null,
  });

  // Handle node text change
  const handleNodeTextChange = useCallback((nodeId: string, newText: string) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId && node.type === 'text' 
          ? { ...node, text: newText } 
          : node
      )
    );
    // Optional: If text change affects node dimensions, update edges
    // const updatedNode = nodes.find(n => n.id === nodeId);
    // if (updatedNode) {
    //   // This might require recalculating width/height in TextNode and passing it up
    //   // For now, assuming text change doesn't immediately change rendered width/height for edges
    //   updateEdgeConnectionPoints(nodeId, updatedNode.x, updatedNode.y);
    // }
  }, [nodes]); // Added nodes to dependency array

  // Handle edge creation completion
  useEffect(() => {
    if (edgeCreationState.sourceNodeId && edgeCreationState.targetNodeId) {
      const sourceNode = nodes.find(n => n.id === edgeCreationState.sourceNodeId);
      const targetNode = nodes.find(n => n.id === edgeCreationState.targetNodeId);
      
      if (sourceNode && targetNode) {
        const newEdge = EdgeFactory.createEdge(sourceNode, targetNode);
        setEdges(prevEdges => [...prevEdges, newEdge]);
        
        // Reset edge creation state
        setEdgeCreationMode('none');
        setEdgeCreationState({
          isCreating: false,
          sourceNodeId: null,
          targetNodeId: null,
          tempEdge: null,
        });
      }
    }
  }, [edgeCreationState.sourceNodeId, edgeCreationState.targetNodeId, nodes]);

  // Update edge connection points when nodes move
  const updateEdgeConnectionPoints = useCallback((nodeId: string, newX: number, newY: number) => {
    setEdges(prevEdges => 
      prevEdges.map(edge => {
        if (edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId) {
          const sourceNode = nodes.find(n => n.id === edge.sourceNodeId);
          const targetNode = nodes.find(n => n.id === edge.targetNodeId);
          
          if (sourceNode && targetNode) {
            // Update the node position temporarily for calculation
            const updatedSourceNode = edge.sourceNodeId === nodeId 
              ? { ...sourceNode, x: newX, y: newY }
              : sourceNode;
            const updatedTargetNode = edge.targetNodeId === nodeId 
              ? { ...targetNode, x: newX, y: newY }
              : targetNode;
              
            return EdgeFactory.updateEdgeConnectionPoints(edge, updatedSourceNode, updatedTargetNode);
          }
        }
        return edge;
      })
    );
  }, [nodes]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null); // Deselect any selected edge
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        selected: node.id === nodeId
      }))
    );
    setEdges(prevEdges =>
      prevEdges.map(edge => ({
        ...edge,
        selected: false
      }))
    );
  }, []);

  const handleNodeDragEnd = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId ? { ...node, x, y } : node
      )
    );
    updateEdgeConnectionPoints(nodeId, x, y);
  }, [updateEdgeConnectionPoints]);

  const handleNodeResize = useCallback((nodeId: string, width: number, height?: number) => {
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.id === nodeId) {
          if (node.type === 'rectangle') {
            return { ...node, width, height: height || width };
          } else if (node.type === 'circle') {
            // For circles, width represents diameter, so radius = width/2
            return { ...node, radius: width / 2 };
          }
        }
        return node;
      })
    );
    
    // Update edge connection points when node size changes
    const resizedNode = nodes.find(n => n.id === nodeId);
    if (resizedNode) {
      updateEdgeConnectionPoints(nodeId, resizedNode.x, resizedNode.y);
    }
  }, [nodes, updateEdgeConnectionPoints]);

  const handleEdgeSelect = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null); // Deselect any selected node
    setEdges(prevEdges =>
      prevEdges.map(edge => ({
        ...edge,
        selected: edge.id === edgeId
      }))
    );
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        selected: false
      }))
    );
  }, []);

  const handleStageClick = useCallback((x: number, y: number) => {
    // Deselect all nodes and edges
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        selected: false
      }))
    );
    setEdges(prevEdges =>
      prevEdges.map(edge => ({
        ...edge,
        selected: false
      }))
    );
  }, []);

  const addNode = useCallback((type: 'text' | 'rectangle' | 'circle') => {
    let newNode: DiagramNode;
    const centerX = 500;
    const centerY = 300;

    switch (type) {
      case 'text':
        newNode = NodeFactory.createTextNode(centerX, centerY, 'New Text');
        break;
      case 'rectangle':
        newNode = NodeFactory.createRectangleNode(centerX, centerY);
        break;
      case 'circle':
        newNode = NodeFactory.createCircleNode(centerX, centerY);
        break;
    }

    setNodes(prevNodes => [...prevNodes, newNode]);
  }, []);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setEdgeCreationMode('none');
  }, []);

  const toggleEdgeCreation = useCallback(() => {
    if (edgeCreationMode === 'creating') {
      setEdgeCreationMode('none');
    } else {
      setEdgeCreationMode('creating');
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, [edgeCreationMode]);

  const deleteSelectedItem = useCallback(() => {
    if (selectedNodeId) {
      // Delete node and its connected edges
      setNodes(prevNodes => prevNodes.filter(node => node.id !== selectedNodeId));
      setEdges(prevEdges => prevEdges.filter(edge => 
        edge.sourceNodeId !== selectedNodeId && edge.targetNodeId !== selectedNodeId
      ));
      setSelectedNodeId(null);
    } else if (selectedEdgeId) {
      // Delete edge
      setEdges(prevEdges => prevEdges.filter(edge => edge.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  }, [selectedNodeId, selectedEdgeId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Exegeta - Diagram Editor
        </p>
      </div>

      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Interactive Diagram Canvas
          </h1>
          <p className="text-gray-600 mb-6">
            Create nodes, move them around, and connect them with edges to build diagrams.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Node Controls */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => addNode('text')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add Text Node
            </button>
            <button
              onClick={() => addNode('rectangle')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Add Rectangle
            </button>
            <button
              onClick={() => addNode('circle')}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Add Circle
            </button>
          </div>

          {/* Edge and Action Controls */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={toggleEdgeCreation}
              className={`px-4 py-2 rounded transition-colors ${
                edgeCreationMode === 'creating'
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {edgeCreationMode === 'creating' ? 'Cancel Edge Creation' : 'Create Edge'}
            </button>
            <button
              onClick={deleteSelectedItem}
              disabled={!selectedNodeId && !selectedEdgeId}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Delete Selected
            </button>
            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear Canvas
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4 text-center text-sm text-gray-600">
          {edgeCreationMode === 'creating' ? (
            <div className="space-y-1">
              <div className="font-semibold text-orange-600">Edge Creation Mode</div>
              {!edgeCreationState.sourceNodeId ? (
                <div>Click on a node to select as source</div>
              ) : (
                <div>Source selected. Click on another node to create an edge.</div>
              )}
            </div>
          ) : selectedNodeId ? (
            <span>Selected node: <code className="bg-gray-100 px-2 py-1 rounded">{selectedNodeId}</code></span>
          ) : selectedEdgeId ? (
            <span>Selected edge: <code className="bg-gray-100 px-2 py-1 rounded">{selectedEdgeId}</code></span>
          ) : (
            <span>Click on a node or edge to select it</span>
          )}
        </div>

        {/* Canvas Component */}
        <div className="flex justify-center">
          <CanvasWrapper 
            width={1000} 
            height={600} 
            className="rounded-lg shadow-lg"
            nodes={nodes}
            edges={edges}
            edgeCreationMode={edgeCreationMode}
            onNodeSelect={handleNodeSelect}
            onNodeDragEnd={handleNodeDragEnd}
            onNodeResize={handleNodeResize}
            onNodeTextChange={handleNodeTextChange}
            onEdgeSelect={handleEdgeSelect}
            onEdgeCreationStateChange={setEdgeCreationState}
            onStageClick={handleStageClick}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-800 mb-2">🖱️ Zoom & Pan</div>
            <p>Mouse wheel to zoom, drag empty space to pan</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="font-semibold text-green-800 mb-2">👆 Select</div>
            <p>Click on nodes or edges to select them</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="font-semibold text-purple-800 mb-2">📐 Move</div>
            <p>Drag nodes to move them (edges follow automatically)</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="font-semibold text-orange-800 mb-2">🔗 Connect</div>
            <p>Use &quot;Create Edge&quot; mode to connect nodes</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {nodes.length} nodes, {edges.length} edges
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Basic Nodes{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              ✅
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Text, rectangle, and circle nodes with selection and drag functionality!
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Edge Creation{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              ✅
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Connect nodes with edges to create meaningful diagrams!
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Node Movement{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              ✅
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Click and drag nodes around - edges follow automatically!
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-808/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Export/Import{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-balance text-sm opacity-50">
            Save and restore your diagrams as JSON files.
          </p>
        </div>
      </div>
    </main>
  );
} 