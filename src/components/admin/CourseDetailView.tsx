import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Book, FileText } from "lucide-react";

interface CourseDetailViewProps {
  course: any;
  onEditCourse: (course: any) => void;
  onDeleteCourse: (courseId: string) => void;
  onCreateModule: () => void;
  onEditModule: (module: any) => void;
  onDeleteModule: (moduleId: string) => void;
  templates: any[];
}

const CourseDetailView = ({
  course,
  onEditCourse,
  onDeleteCourse,
  onCreateModule,
  onEditModule,
  onDeleteModule,
  templates
}: CourseDetailViewProps) => {
  if (!course) return null;

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{course.title}</h3>
          <p className="text-muted-foreground mt-1">{course.description}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant={course.is_active ? "default" : "secondary"}>
              {course.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">${course.price / 100}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEditCourse(course)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onDeleteCourse(course.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Course Overview */}
      {course.overview_title && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="font-medium">{course.overview_title}</h4>
            {course.overview_subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{course.overview_subtitle}</p>
            )}
            {course.overview_description && (
              <p className="mt-2">{course.overview_description}</p>
            )}
            {course.features && course.features.length > 0 && (
              <div className="mt-3">
                <h5 className="font-medium mb-2">Features:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {course.features.map((feature: string, index: number) => (
                    <li key={index} className="text-sm">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modules */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Modules ({course.modules?.length || 0})
            </CardTitle>
            <Button size="sm" onClick={onCreateModule}>
              <Plus className="h-4 w-4 mr-1" />
              Add Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {course.modules && course.modules.length > 0 ? (
            <div className="space-y-3">
              {course.modules
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((module: any) => (
                <div key={module.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{module.order_index}</span>
                      <h4 className="font-medium">{module.name}</h4>
                      {module.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                    </div>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{module.component}</Badge>
                      {module.icon && <Badge variant="outline" className="text-xs">{module.icon}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onEditModule(module)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDeleteModule(module.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Book className="mx-auto h-12 w-12 mb-4" />
              <p>No modules created yet</p>
              <p className="text-sm">Start by adding your first module</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Available Templates ({templates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2">
              {templates.map((template) => (
                <div key={template.id} className="p-3 border rounded">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-muted-foreground">{template.category}</div>
                  <Badge variant="outline" className="text-xs mt-1">{template.document_type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No templates available</p>
              <p className="text-sm">Create templates in the Templates tab</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetailView;