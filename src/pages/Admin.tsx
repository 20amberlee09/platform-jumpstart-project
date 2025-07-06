import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CourseDetailView from "@/components/admin/CourseDetailView";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Award, 
  FileText, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Download,
  Plus
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  ministerCount: number;
  documentsGenerated: number;
  pendingVerifications: number;
}

interface MinisterUser {
  id: string;
  email: string;
  first_name: string;
  minister_name: string;
  minister_verified: boolean;
  minister_certificate_url: string;
  created_at: string;
  verification_status: string;
}

const Admin = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    ministerCount: 0,
    documentsGenerated: 0,
    pendingVerifications: 0
  });
  
  const [ministerUsers, setMinisterUsers] = useState<MinisterUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { isAdmin } = useAdminData();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
      loadCourses();
      loadTemplates();
    }
  }, [isAdmin]);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules (
            id,
            name,
            title,
            description,
            order_index,
            component,
            icon,
            required,
            templates,
            content
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Courses",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Templates",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createCourse = async (courseData: any) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Course Created",
        description: "New course has been created successfully",
      });

      loadCourses();
      setShowCourseForm(false);
      setEditingCourse(null);
    } catch (error: any) {
      toast({
        title: "Error Creating Course",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateCourse = async (courseId: string, courseData: any) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Course Updated",
        description: "Course has been updated successfully",
      });

      loadCourses();
      setShowCourseForm(false);
      setEditingCourse(null);
    } catch (error: any) {
      toast({
        title: "Error Updating Course",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all modules within it.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Course Deleted",
        description: "Course and all its modules have been deleted",
      });

      loadCourses();
      setSelectedCourse(null);
    } catch (error: any) {
      toast({
        title: "Error Deleting Course",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createModule = async (moduleData: any) => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .insert([moduleData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Module Created",
        description: "New module has been created successfully",
      });

      loadCourses();
      setShowModuleForm(false);
      setEditingModule(null);
    } catch (error: any) {
      toast({
        title: "Error Creating Module",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateModule = async (moduleId: string, moduleData: any) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: "Module Updated",
        description: "Module has been updated successfully",
      });

      loadCourses();
      setShowModuleForm(false);
      setEditingModule(null);
    } catch (error: any) {
      toast({
        title: "Error Updating Module",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: "Module Deleted",
        description: "Module has been deleted successfully",
      });

      loadCourses();
    } catch (error: any) {
      toast({
        title: "Error Deleting Module",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createTemplate = async (templateData: any) => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Template Created",
        description: "New template has been created successfully",
      });

      loadTemplates();
      setShowTemplateForm(false);
      setEditingTemplate(null);
    } catch (error: any) {
      toast({
        title: "Error Creating Template",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateTemplate = async (templateId: string, templateData: any) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .update(templateData)
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Template Updated",
        description: "Template has been updated successfully",
      });

      loadTemplates();
      setShowTemplateForm(false);
      setEditingTemplate(null);
    } catch (error: any) {
      toast({
        title: "Error Updating Template",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully",
      });

      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error Deleting Template",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Get basic stats
      const [usersResult, coursesResult, ordersResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('courses').select('*', { count: 'exact' }),
        supabase.from('orders').select('amount').eq('status', 'completed')
      ]);

      // Get minister-specific stats
      const ministerResult = await supabase
        .from('profiles')
        .select('*')
        .eq('minister_verified', true);

      const pendingResult = await supabase
        .from('profiles')
        .select('*')
        .eq('verification_status', 'pending')
        .not('minister_certificate_url', 'is', null);

      const documentsResult = await supabase
        .from('document_files')
        .select('*', { count: 'exact' })
        .eq('document_type', 'generated_document');

      // Calculate revenue
      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalRevenue: totalRevenue / 100, // Convert from cents
        ministerCount: ministerResult.data?.length || 0,
        documentsGenerated: documentsResult.count || 0,
        pendingVerifications: pendingResult.data?.length || 0
      });

      // Load minister users with email data
      const { data: ministerData } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          minister_name,
          minister_verified,
          minister_certificate_url,
          verification_status,
          created_at,
          user_id
        `)
        .not('minister_certificate_url', 'is', null)
        .order('created_at', { ascending: false });

      if (ministerData) {
        const formattedMinisters = ministerData.map(user => ({
          id: user.id,
          email: 'Loading...', // Will be loaded separately due to auth table restrictions
          first_name: user.first_name || '',
          minister_name: user.minister_name || '',
          minister_verified: user.minister_verified || false,
          minister_certificate_url: user.minister_certificate_url || '',
          verification_status: user.verification_status || 'pending',
          created_at: user.created_at
        }));
        setMinisterUsers(formattedMinisters);
      }

    } catch (error: any) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMinister = async (userId: string, verify: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          minister_verified: verify,
          verification_status: verify ? 'verified' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: verify ? "Minister Verified" : "Minister Rejected",
        description: `Minister status has been ${verify ? 'approved' : 'rejected'}`,
      });

      // Refresh data
      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update minister status",
        variant: "destructive"
      });
    }
  };

  const downloadCertificate = (url: string) => {
    window.open(url, '_blank');
  };

  // Course Form Modal
  const CourseForm = ({ show, onClose, course, onSubmit }: any) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      price: 0,
      is_active: true,
      ...course
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>{course ? 'Edit Course' : 'Create New Course'}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (cents)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{course ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Card>
      </div>
    );
  };

  // Module Form Modal
  const ModuleForm = ({ show, onClose, module, courseId, onSubmit, templates }: any) => {
    const [formData, setFormData] = useState({
      name: '',
      title: '',
      description: '',
      content: {},
      templates: [],
      order_index: 0,
      course_id: courseId,
      component: 'default',
      icon: '',
      required: true,
      ...module
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const toggleTemplate = (templateId: string) => {
      const templates = formData.templates || [];
      const updated = templates.includes(templateId)
        ? templates.filter((id: string) => id !== templateId)
        : [...templates, templateId];
      setFormData({...formData, templates: updated});
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle>{module ? 'Edit Module' : 'Create New Module'}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Module Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_index">Order</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="component">Component</Label>
                  <Input
                    id="component"
                    value={formData.component}
                    onChange={(e) => setFormData({...formData, component: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required}
                  onChange={(e) => setFormData({...formData, required: e.target.checked})}
                />
                <Label htmlFor="required">Required</Label>
              </div>
              <div className="space-y-2">
                <Label>Available Templates</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                  {templates.map((template: any) => (
                    <div key={template.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={template.id}
                        checked={(formData.templates || []).includes(template.id)}
                        onChange={() => toggleTemplate(template.id)}
                      />
                      <Label htmlFor={template.id} className="text-sm">{template.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{module ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Card>
      </div>
    );
  };

  // Template Form Modal
  const TemplateForm = ({ show, onClose, template, onSubmit }: any) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      category: 'trust',
      document_type: 'pdf_template',
      template_content: '',
      template_fields: [],
      is_active: true,
      ...template
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle>{template ? 'Edit Template' : 'Create New Template'}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full p-2 border rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="trust">Trust Documents</option>
                    <option value="legal">Legal Documents</option>
                    <option value="certificate">Certificates</option>
                    <option value="form">Forms</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document_type">Document Type</Label>
                  <select
                    id="document_type"
                    className="w-full p-2 border rounded-md"
                    value={formData.document_type}
                    onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                  >
                    <option value="pdf_template">PDF Template</option>
                    <option value="html_template">HTML Template</option>
                    <option value="form_template">Form Template</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template_content">Template Content</Label>
                <textarea
                  id="template_content"
                  className="w-full p-2 border rounded-md font-mono text-sm"
                  rows={8}
                  value={formData.template_content}
                  onChange={(e) => setFormData({...formData, template_content: e.target.value})}
                  placeholder="Enter template content (HTML, text, or upload file URL)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{template ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Card>
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your platform and monitor performance</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ministers">Ministers</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.ministerCount} ministers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Ministers</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ministerCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingVerifications} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents Generated</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.documentsGenerated}</div>
                <p className="text-xs text-muted-foreground">
                  Legal documents created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  From course sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">
                  Available for purchase
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ministers Tab */}
        <TabsContent value="ministers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Minister Management</CardTitle>
              <CardDescription>
                Review and manage minister verification requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading minister data...</div>
              ) : ministerUsers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No minister applications found
                </div>
              ) : (
                <div className="space-y-4">
                  {ministerUsers.map((minister) => (
                    <div key={minister.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {minister.minister_name || minister.first_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {minister.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={minister.minister_verified ? "default" : "secondary"}>
                            {minister.minister_verified ? "Verified" : minister.verification_status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Applied: {new Date(minister.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {minister.minister_certificate_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadCertificate(minister.minister_certificate_url)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Certificate
                          </Button>
                        )}
                        
                        {!minister.minister_verified && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleVerifyMinister(minister.id, true)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleVerifyMinister(minister.id, false)}
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                View and manage all generated documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading document data...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.documentsGenerated}</div>
                        <p className="text-sm text-muted-foreground">Total Documents</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.ministerCount}</div>
                        <p className="text-sm text-muted-foreground">Minister Documents</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {Math.round((stats.documentsGenerated / Math.max(stats.totalUsers, 1)) * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Document Archive</h3>
                    <p>Individual document management features will be added as usage grows.</p>
                    <p className="text-sm">Current focus: Minister verification and document generation pipeline.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Platform Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Users</span>
                    <span className="font-medium">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Verified Ministers</span>
                    <span className="font-medium">{stats.ministerCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium">
                      {stats.totalUsers > 0 ? Math.round((stats.ministerCount / stats.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Documents per Minister</span>
                    <span className="font-medium">
                      {stats.ministerCount > 0 ? Math.round(stats.documentsGenerated / stats.ministerCount) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="font-medium">${stats.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average per User</span>
                    <span className="font-medium">
                      ${stats.totalUsers > 0 ? (stats.totalRevenue / stats.totalUsers).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Revenue per Minister</span>
                    <span className="font-medium">
                      ${stats.ministerCount > 0 ? (stats.totalRevenue / stats.ministerCount).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pending Verifications</span>
                    <span className="font-medium">{stats.pendingVerifications}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Platform Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.ministerCount}</div>
                    <div className="text-sm text-muted-foreground">Active Ministers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.documentsGenerated}</div>
                    <div className="text-sm text-muted-foreground">Documents Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.pendingVerifications}</div>
                    <div className="text-sm text-muted-foreground">Pending Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">${stats.totalRevenue.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Management Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Course Management</h2>
              <p className="text-muted-foreground">Manage courses and their modules</p>
            </div>
            <Button onClick={() => setShowCourseForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Course List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {courses.map((course) => (
                  <div 
                    key={course.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedCourse === course.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedCourse(course.id)}
                  >
                    <div className="font-medium">{course.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {course.modules?.length || 0} modules
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Course Details */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCourse ? (
                  <CourseDetailView 
                    course={courses.find(c => c.id === selectedCourse)}
                    onEditCourse={(course) => {
                      setEditingCourse(course);
                      setShowCourseForm(true);
                    }}
                    onDeleteCourse={deleteCourse}
                    onCreateModule={() => setShowModuleForm(true)}
                    onEditModule={(module) => {
                      setEditingModule(module);
                      setShowModuleForm(true);
                    }}
                    onDeleteModule={deleteModule}
                    templates={templates}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a course to view details
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Management Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Template Library</h2>
              <p className="text-muted-foreground">Manage document templates for courses</p>
            </div>
            <Button onClick={() => setShowTemplateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-muted-foreground">{template.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge variant="outline">{template.document_type}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Modals */}
      <CourseForm
        show={showCourseForm}
        onClose={() => {
          setShowCourseForm(false);
          setEditingCourse(null);
        }}
        course={editingCourse}
        onSubmit={editingCourse ? 
          (data: any) => updateCourse(editingCourse.id, data) : 
          createCourse
        }
      />

      <ModuleForm
        show={showModuleForm}
        onClose={() => {
          setShowModuleForm(false);
          setEditingModule(null);
        }}
        module={editingModule}
        courseId={selectedCourse}
        templates={templates}
        onSubmit={editingModule ? 
          (data: any) => updateModule(editingModule.id, data) : 
          createModule
        }
      />

      <TemplateForm
        show={showTemplateForm}
        onClose={() => {
          setShowTemplateForm(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSubmit={editingTemplate ? 
          (data: any) => updateTemplate(editingTemplate.id, data) : 
          createTemplate
        }
      />
    </div>
  );
};

export default Admin;