import React from "react";

export default function ConfirmationModal({ open, title, onConfirm, onCancel, requirePin, pin, setPin }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-[90%] max-w-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        {requirePin && (
          <input
            className="w-full border p-2 rounded mb-2"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        )}
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={onCancel}>Cancel</button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
