import React from "react"
import { X } from "lucide-react"

function FilePreview({ file, onRemove }) {
  return (
    <div className="file-preview">
      <span>{file.name}</span>
      <button onClick={onRemove} className="remove-file">
        <X size={16} />
      </button>
    </div>
  )
}

export default FilePreview

