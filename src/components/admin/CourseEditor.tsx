import { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface CourseEditorProps {
  course: any;
  onClose: () => void;
}

const CourseEditor = ({ course, onClose }: CourseEditorProps) => {
  const { saveCourse, deleteCourse } = useAdminData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>(course?.features || []);
  const [newFeature, setNewFeature] = useState('');
  
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    price: course?.price ? (course.price / 100).toString() : '',
    overview_title: course?.overview_title || '',
    overview_subtitle: course?.overview_subtitle || '',
    overview_description: course?.overview_description || '',
    is_active: course?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = {
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        features,
      };

      const dataToSave = course?.id 
        ? { ...courseData, id: course.id }
        : courseData;

      await saveCourse(dataToSave);
      
      toast({
        title: "Success",
        description: `Course ${course?.id ? 'updated' : 'created'} successfully`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!course?.id) return;
    
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await deleteCourse(course.id);
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      onClose();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {course?.id ? 'Edit Course' : 'Create New Course'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
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
              <Label htmlFor="overview_title">Overview Title</Label>
              <Input
                id="overview_title"
                value={formData.overview_title}
                onChange={(e) => setFormData(prev => ({ ...prev, overview_title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="overview_subtitle">Overview Subtitle</Label>
              <Input
                id="overview_subtitle"
                value={formData.overview_subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, overview_subtitle: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="overview_description">Overview Description</Label>
            <Textarea
              id="overview_description"
              value={formData.overview_description}
              onChange={(e) => setFormData(prev => ({ ...prev, overview_description: e.target.value }))}
            />
          </div>

          <div>
            <Label>Course Features</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add a feature..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFeature(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Course is active</Label>
          </div>

          <div className="flex justify-between">
            <div>
              {course?.id && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete Course
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (course?.id ? 'Update' : 'Create')}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseEditor;