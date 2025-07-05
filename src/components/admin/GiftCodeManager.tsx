import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Gift, Copy, Plus, Calendar, User, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Course {
  id: string;
  title: string;
  price: number;
}

interface GiftCode {
  id: string;
  code: string;
  course_id: string;
  course_title: string;
  created_by: string;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface GiftCodeManagerProps {
  courses: Course[];
}

const GiftCodeManager = ({ courses }: GiftCodeManagerProps) => {
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchGiftCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_codes')
        .select(`
          *,
          courses!inner(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        course_title: item.courses.title
      })) || [];

      setGiftCodes(formattedData);
    } catch (error: any) {
      toast({
        title: "Error fetching gift codes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftCodes();
  }, []);

  const generateGiftCode = async () => {
    if (!selectedCourse || !user) return;

    setGenerating(true);
    try {
      // Generate a random 8-character code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { error } = await supabase
        .from('gift_codes')
        .insert([{
          code,
          course_id: selectedCourse,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Gift code generated!",
        description: `Code: ${code}`,
      });

      setSelectedCourse('');
      fetchGiftCodes();
    } catch (error: any) {
      toast({
        title: "Error generating gift code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Gift code ${code} copied to clipboard`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate New Gift Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Generate Gift Code
          </CardTitle>
          <CardDescription>
            Create free access codes for specific courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="course-select">Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title} - ${(course.price / 100).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={generateGiftCode} 
              disabled={!selectedCourse || generating}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Gift Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Gift Code History</CardTitle>
          <CardDescription>
            View and manage all generated gift codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {giftCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No gift codes generated yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {giftCodes.map((giftCode) => (
                <Card key={giftCode.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {giftCode.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(giftCode.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Badge variant={giftCode.used_by ? 'secondary' : 'default'}>
                          {giftCode.used_by ? 'Used' : 'Available'}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{giftCode.course_title}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created: {formatDate(giftCode.created_at)}
                        </div>
                        {giftCode.used_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Used: {formatDate(giftCode.used_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftCodeManager;
