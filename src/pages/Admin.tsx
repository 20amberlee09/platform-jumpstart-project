import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Award, 
  FileText, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Download
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
  const { isAdmin } = useAdminData();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ministers">Ministers</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default Admin;