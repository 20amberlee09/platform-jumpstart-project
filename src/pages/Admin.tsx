import { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Users, BookOpen, Layers, DollarSign } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import CourseEditor from '@/components/admin/CourseEditor';
import ModuleEditor from '@/components/admin/ModuleEditor';

const Admin = () => {
  const { user } = useAuth();
  const { courses, modules, isAdmin, loading } = useAdminData();
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [showCourseEditor, setShowCourseEditor] = useState(false);
  const [showModuleEditor, setShowModuleEditor] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have admin privileges. Contact an administrator to gain access.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalRevenue = courses.reduce((sum, course) => sum + (course.price * 0.01), 0);
  const totalModules = modules.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage courses, modules, and system settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalModules}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.filter(c => c.is_active).length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Course Management</CardTitle>
                    <CardDescription>Create and manage your courses</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setEditingCourse(null);
                    setShowCourseEditor(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <Card key={course.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{course.title}</h3>
                            <Badge variant={course.is_active ? 'default' : 'secondary'}>
                              {course.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                          <p className="text-sm font-medium">${(course.price / 100).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {modules.filter(m => m.course_id === course.id).length} modules
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingCourse(course);
                            setShowCourseEditor(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Module Management</CardTitle>
                    <CardDescription>Create and manage course modules</CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingModule(null);
                      setShowModuleEditor(true);
                    }}
                    disabled={courses.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => {
                    const courseModules = modules.filter(m => m.course_id === course.id);
                    return (
                      <div key={course.id}>
                        <h3 className="font-semibold mb-3 text-primary">{course.title}</h3>
                        <div className="space-y-2 mb-6">
                          {courseModules.map((module) => (
                            <Card key={module.id} className="p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">#{module.order_index + 1}</span>
                                    <h4 className="font-medium">{module.name}</h4>
                                    <Badge variant={module.required ? 'default' : 'secondary'}>
                                      {module.required ? 'Required' : 'Optional'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{module.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Component: {module.component}
                                  </p>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingModule(module);
                                    setShowModuleEditor(true);
                                  }}
                                >
                                  Edit
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Course Editor Modal */}
        {showCourseEditor && (
          <CourseEditor
            course={editingCourse}
            onClose={() => {
              setShowCourseEditor(false);
              setEditingCourse(null);
            }}
          />
        )}

        {/* Module Editor Modal */}
        {showModuleEditor && (
          <ModuleEditor
            module={editingModule}
            courses={courses}
            onClose={() => {
              setShowModuleEditor(false);
              setEditingModule(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;