
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collaborator } from '@/pages/Index';

interface CollaboratorSectionProps {
  numberOfCollaborators: number;
  setNumberOfCollaborators: (count: number) => void;
  collaborators: Collaborator[];
  setCollaborators: (collaborators: Collaborator[]) => void;
}

const CollaboratorSection: React.FC<CollaboratorSectionProps> = ({
  numberOfCollaborators,
  setNumberOfCollaborators,
  collaborators,
  setCollaborators
}) => {
  
  useEffect(() => {
    const defaultPercentage = numberOfCollaborators > 0 ? Math.floor(100 / numberOfCollaborators) : 100;
    const newCollaborators: Collaborator[] = [];
    
    for (let i = 0; i < numberOfCollaborators; i++) {
      const existingCollaborator = collaborators[i];
      newCollaborators.push({
        id: existingCollaborator?.id || `collab-${i}`,
        name: existingCollaborator?.name || '',
        sharePercentage: existingCollaborator?.sharePercentage || defaultPercentage
      });
    }
    
    setCollaborators(newCollaborators);
  }, [numberOfCollaborators]);

  const handleCollaboratorChange = (index: number, field: 'name' | 'sharePercentage', value: string | number) => {
    const updatedCollaborators = [...collaborators];
    updatedCollaborators[index] = {
      ...updatedCollaborators[index],
      [field]: value
    };
    setCollaborators(updatedCollaborators);
  };

  const totalPercentage = collaborators.reduce((sum, collab) => sum + collab.sharePercentage, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-purple-600">🤝 Work Together</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="collaboratorCount">Number of Collaborators</Label>
          <Input
            id="collaboratorCount"
            type="number"
            min="1"
            max="10"
            value={numberOfCollaborators}
            onChange={(e) => setNumberOfCollaborators(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-32"
          />
        </div>

        {collaborators.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Configure profit sharing among collaborators:
            </div>
            
            {collaborators.map((collaborator, index) => (
              <div key={collaborator.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-card">
                <div>
                  <Label htmlFor={`name-${index}`}>🧑 Name</Label>
                  <Input
                    id={`name-${index}`}
                    placeholder={`Collaborator ${index + 1}`}
                    value={collaborator.name}
                    onChange={(e) => handleCollaboratorChange(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`percentage-${index}`}>📈 Share Percentage (%)</Label>
                  <Input
                    id={`percentage-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    value={collaborator.sharePercentage}
                    onChange={(e) => handleCollaboratorChange(index, 'sharePercentage', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            ))}
            
            <div className={`text-sm font-medium ${
              totalPercentage === 100 ? 'text-green-600' : 'text-orange-600'
            }`}>
              Total Percentage: {totalPercentage}%
              {totalPercentage !== 100 && (
                <span className="ml-2 text-orange-600">
                  (Should equal 100%)
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CollaboratorSection;
