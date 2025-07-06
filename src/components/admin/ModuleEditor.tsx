import { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ModuleEditorProps {
  module: any;
  courses: any[];
  onClose: () => void;
}

const AVAILABLE_COMPONENTS = [
  'StepPayment',
  'StepNDA',
  'StepIdentity',
  'StepTrustName',
  'StepOrdination',
  'StepGmailSetup',
  'StepVerificationTools',
  'StepDocumentGeneration',
  'StepReview',
  'StepSignatures',
];

const AVAILABLE_ICONS = [
  'CreditCard',
  'Shield',
  'FileCheck',
  'Search',
  'Award',
  'Mail',
  'QrCode',
  'FileText',
  'CheckCircle',
  'PenTool',
  'Settings',
  'Users',
  'BookOpen',
  'Lock',
  'Download',
];

const ModuleEditor = ({ module, courses, onClose }: ModuleEditorProps) => {
  const { saveModule, deleteModule } = useAdminData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    course_id: module?.course_id || '',
    name: module?.name || '',
    description: module?.description || '',
    component: module?.component || '',
    required: module?.required ?? true,
    order_index: module?.order_index?.toString() || '0',
    icon: module?.icon || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const moduleData = {
        ...formData,
        order_index: parseInt(formData.order_index),
      };

      const dataToSave = module?.id 
        ? { ...moduleData, id: module.id }
        : moduleData;

      await saveModule(dataToSave);
      
      toast({
        title: "Success",
        description: `Module ${module?.id ? 'updated' : 'created'} successfully`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving module:', error);
      toast({
        title: "Error",
        description: "Failed to save module. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!module?.id) return;
    
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await deleteModule(module.id);
      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
      onClose();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast({
        title: "Error",
        description: "Failed to delete module. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {module?.id ? 'Edit Module' : 'Create New Module'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="course_id">Course</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Module Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="order_index">Order</Label>
              <Input
                id="order_index"
                type="number"
                min="0"
                value={formData.order_index}
                onChange={(e) => setFormData(prev => ({ ...prev, order_index: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="component">Component</Label>
              <Select
                value={formData.component}
                onValueChange={(value) => setFormData(prev => ({ ...prev, component: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select component" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_COMPONENTS.map((component) => (
                    <SelectItem key={component} value={component}>
                      {component}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))}
            />
            <Label htmlFor="required">Module is required</Label>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {module?.id && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete Module
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (module?.id ? 'Update' : 'Create')}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleEditor;