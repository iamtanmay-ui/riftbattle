'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export function AthenaIdsManager() {
  const [athenaIds, setAthenaIds] = useState<string[]>([]);
  const [newId, setNewId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addId = () => {
    if (newId.trim() && !athenaIds.includes(newId.trim())) {
      setAthenaIds([...athenaIds, newId.trim()]);
      setNewId('');
    }
  };

  const removeId = (idToRemove: string) => {
    setAthenaIds(athenaIds.filter(id => id !== idToRemove));
  };

  const handleSubmit = async () => {
    if (athenaIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one Athena ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/seller/add-athena-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ athena_ids: athenaIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add Athena IDs');
      }

      toast({
        title: 'Success',
        description: 'Athena IDs added successfully!',
      });
      setAthenaIds([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add Athena IDs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter Athena ID"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addId();
            }
          }}
        />
        <Button onClick={addId} disabled={!newId.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {athenaIds.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Added IDs:</h3>
          <div className="space-y-2">
            {athenaIds.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <span className="text-sm">{id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeId(id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isLoading || athenaIds.length === 0}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding IDs...
          </>
        ) : (
          'Add Athena IDs'
        )}
      </Button>
    </div>
  );
} 