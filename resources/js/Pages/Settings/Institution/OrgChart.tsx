import React, { useMemo, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { ZoomIn, ZoomOut, Download, Map } from 'lucide-react';
import { stratify, tree } from 'd3-hierarchy';

interface OrgUnit {
    id: string;
    name: string;
    title: string | null;
    parent_id: string | null;
}

interface Props {
    orgUnits: OrgUnit[];
}

export default function OrgChart({ orgUnits }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Transform flat data to hierarchy
    const root = useMemo(() => {
        if (!orgUnits.length) return null;
        
        // Handle case where root might not have null parent_id if data is malformed
        try {
            const hierarchy = stratify<OrgUnit>()
                .id(d => d.id)
                .parentId(d => d.parent_id)(orgUnits);
            
            // Generate tree layout
            // Node size is approx 200px width, 100px height. Adjust spacing.
            const treeLayout = tree<OrgUnit>().nodeSize([250, 150]);
            return treeLayout(hierarchy);
        } catch (e) {
            console.error("Data struktur organisasi tidak valid", e);
            return null;
        }
    }, [orgUnits]);

    const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 3));
    const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.2));
    
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const downloadSvg = () => {
        if (!svgRef.current) return;
        
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'struktur-organisasi.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout title="Visual Struktur Organisasi">
            <div className="flex flex-col h-[calc(100vh-8rem)]">
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Visual Struktur Organisasi</h2>
                        <p className="text-sm text-fg-muted mt-1">Gunakan mouse untuk menggeser (pan) dan tombol untuk zoom.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onPress={handleZoomOut} className="px-3" title="Zoom Out">
                            <ZoomOut className="size-4" />
                        </Button>
                        <Button variant="secondary" onPress={handleZoomIn} className="px-3" title="Zoom In">
                            <ZoomIn className="size-4" />
                        </Button>
                        <Button variant="primary" onPress={downloadSvg} title="Unduh SVG">
                            <Download className="size-4" />
                            <span className="hidden sm:inline">Unduh SVG</span>
                        </Button>
                    </div>
                </div>

                <div 
                    className="flex-1 bg-canvas border border-line-subtle rounded-md overflow-hidden relative cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {!root ? (
                        <div className="absolute inset-0 flex items-center justify-center flex-col text-fg-muted">
                            <Map className="size-12 mb-4 opacity-50" />
                            <p>Data struktur organisasi kosong atau tidak valid.</p>
                        </div>
                    ) : (
                        <svg 
                            ref={svgRef}
                            className="w-full h-full"
                            style={{ touchAction: 'none' }}
                        >
                            <g transform={`translate(${pan.x + 500}, ${pan.y + 100}) scale(${scale})`}>
                                {/* Links */}
                                {root.links().map((link, i) => {
                                    // simple elbow connector
                                    const sourceX = link.source.x;
                                    const sourceY = link.source.y + 40; // bottom of source node
                                    const targetX = link.target.x;
                                    const targetY = link.target.y - 40; // top of target node
                                    
                                    const path = `M ${sourceX} ${sourceY} L ${sourceX} ${(sourceY + targetY) / 2} L ${targetX} ${(sourceY + targetY) / 2} L ${targetX} ${targetY}`;
                                    
                                    return (
                                        <path
                                            key={`link-${i}`}
                                            d={path}
                                            fill="none"
                                            stroke="var(--color-line-input)"
                                            strokeWidth="2"
                                            className="transition-all duration-300"
                                        />
                                    );
                                })}

                                {/* Nodes */}
                                {root.descendants().map((node, i) => (
                                    <g 
                                        key={`node-${i}`} 
                                        transform={`translate(${node.x},${node.y})`}
                                        className="transition-all duration-300"
                                    >
                                        <rect
                                            x="-100"
                                            y="-40"
                                            width="200"
                                            height="80"
                                            rx="8"
                                            fill="var(--color-raised)"
                                            stroke="var(--color-accent)"
                                            strokeWidth="2"
                                            className="shadow-sm"
                                        />
                                        <text
                                            y="-5"
                                            textAnchor="middle"
                                            fill="var(--color-fg-strong)"
                                            className="text-sm font-bold"
                                            style={{ fontFamily: 'var(--font-sans)' }}
                                        >
                                            {node.data.name}
                                        </text>
                                        <text
                                            y="15"
                                            textAnchor="middle"
                                            fill="var(--color-fg-muted)"
                                            className="text-xs"
                                            style={{ fontFamily: 'var(--font-sans)' }}
                                        >
                                            {node.data.title || '-'}
                                        </text>
                                    </g>
                                ))}
                            </g>
                        </svg>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
