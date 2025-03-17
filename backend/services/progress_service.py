# services/progress_service.py
from typing import Dict, Optional
import uuid
from datetime import datetime, timedelta
import asyncio
from models.search import ProgressUpdate, SearchProgress

class ProgressService:
    """Service to track and expose search progress information."""
    
    def __init__(self):
        self.progress_records: Dict[str, ProgressUpdate] = {}
        # Start a background task to clean up old records
        self._start_cleanup_task()
    
    def create_search_id(self) -> str:
        """Generate a unique search ID."""
        return str(uuid.uuid4())
    
    def update_progress(self, search_id: str, stage: SearchProgress, message: str, percentage: int = 0) -> None:
        """Update progress for a specific search."""
        self.progress_records[search_id] = ProgressUpdate(
            search_id=search_id,
            stage=stage,
            message=message,
            percentage=percentage
        )
    
    def get_progress(self, search_id: str) -> Optional[ProgressUpdate]:
        """Get the current progress for a search."""
        return self.progress_records.get(search_id)
    
    async def _cleanup_old_records(self):
        """Clean up progress records older than 1 hour."""
        while True:
            # Clean up records older than 1 hour
            keys_to_delete = []
            for search_id, progress in self.progress_records.items():
                # Remove records for completed or failed searches after an hour
                if (progress.stage == SearchProgress.COMPLETE or 
                    progress.stage == SearchProgress.ERROR):
                    keys_to_delete.append(search_id)
            
            for key in keys_to_delete:
                self.progress_records.pop(key, None)
            
            # Sleep for 10 minutes before next cleanup
            await asyncio.sleep(600)
    
    def _start_cleanup_task(self):
        """Start the background cleanup task."""
        asyncio.create_task(self._cleanup_old_records())