"use client";

import { useEffect, useRef, useState } from "react";
import { PLOT, Room } from "@/lib/floorplan";

interface FloorPlanProps {
  rooms: Room[];
  editable?: boolean;
  is3d?: boolean;
  generating?: boolean;
  /** Continuous scan-line sweep, for ambient life. */
  ambient?: boolean;
  selectedId?: string;
  onSelect?: (room: Room) => void;
  /** Fired after an editable drag updates the layout. */
  onChange?: (rooms: Room[]) => void;
  className?: string;
}

export default function FloorPlan({
  rooms,
  editable = false,
  is3d = false,
  generating = false,
  ambient = false,
  selectedId,
  onSelect,
  onChange,
  className = "",
}: FloorPlanProps) {
  // Editable boards own their geometry; presentational boards render props directly.
  const [local, setLocal] = useState<Room[]>(rooms);
  useEffect(() => {
    if (!editable) setLocal(rooms);
  }, [rooms, editable]);
  // seed editable state once
  useEffect(() => {
    if (editable) setLocal(rooms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const model = editable ? local : rooms;
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    room: Room;
    sx: number;
    sy: number;
    rect: DOMRect;
  } | null>(null);

  function onPointerDown(e: React.PointerEvent, room: Room) {
    if (onSelect) onSelect(room);
    if (!editable || !boardRef.current) return;
    drag.current = {
      room,
      sx: e.clientX,
      sy: e.clientY,
      rect: boardRef.current.getBoundingClientRect(),
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dxft = ((e.clientX - d.sx) / d.rect.width) * PLOT.w;
    const dyft = ((e.clientY - d.sy) / d.rect.height) * PLOT.h;
    const nx = Math.max(0, Math.min(PLOT.w - d.room.w, Math.round(d.room.x + dxft)));
    const ny = Math.max(0, Math.min(PLOT.h - d.room.h, Math.round(d.room.y + dyft)));
    const updated: Room = { ...d.room, x: nx, y: ny };
    // update our own geometry, then notify the parent OUTSIDE the updater
    setLocal((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (onSelect) onSelect(updated);
  }

  function endDrag() {
    if (drag.current && onChange) onChange(local);
    drag.current = null;
  }

  return (
    <div
      ref={boardRef}
      className={`board ${editable ? "editable" : ""} ${is3d ? "is3d" : ""} ${className}`}
      onPointerMove={editable ? onPointerMove : undefined}
      onPointerUp={editable ? endDrag : undefined}
      onPointerCancel={editable ? endDrag : undefined}
    >
      {model.map((r) => (
        <div
          key={r.id}
          data-type={r.type}
          className={`room ${selectedId === r.id ? "sel" : ""}`}
          style={{
            left: `${(r.x / PLOT.w) * 100}%`,
            top: `${(r.y / PLOT.h) * 100}%`,
            width: `${(r.w / PLOT.w) * 100}%`,
            height: `${(r.h / PLOT.h) * 100}%`,
            transition: drag.current?.room.id === r.id ? "none" : undefined,
          }}
          onPointerDown={(e) => onPointerDown(e, r)}
        >
          <span className="rn">{r.name}</span>
          <span className="ra mono">{r.w * r.h} ft²</span>
        </div>
      ))}
      {generating && <div className="genskel" />}
      {ambient && !generating && <div className="scan" />}
    </div>
  );
}
