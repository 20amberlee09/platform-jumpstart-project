import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, Search, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StepTrustNameProps {
  onNext: (stepData?: any) => void;
  onPrev?: () => void;
  data: any;
  courseConfig?: any;
  updateStepData?: (stepKey: string, data: any) => void;
  currentStepKey?: string;
}

const StepTrustName = ({ onNext, onPrev, data, updateStepData, currentStepKey }: StepTrustNameProps) => {
  const [trustName, setTrustName] = useState('');
  const [ustpoChecked, setUstpoChecked] = useState(false);
  const [stateChecked, setStateChecked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved step data
    const stepData = data?.[currentStepKey || 'trustName'];
    if (stepData) {
      setTrustName(stepData.trustName || '');
      setUstpoChecked(stepData.ustpoChecked || false);
      setStateChecked(stepData.stateChecked || false);
      setIsVerified(stepData.isVerified || false);
    }
  }, [data, currentStepKey]);

  useEffect(() => {
    // Auto-save when data changes
    if ((trustName || ustpoChecked || stateChecked || isVerified) && updateStepData && currentStepKey) {
      updateStepData(currentStepKey, {
        trustName,
        ustpoChecked,
        stateChecked,
        isVerified,
        trustEmail: trustName ? `${trustName.toLowerCase().replace(/\s+/g, '')}erltrust@gmail.com` : '',
        updatedAt: new Date().toISOString()
      });
    }
  }, [trustName, ustpoChecked, stateChecked, isVerified, updateStepData, currentStepKey]);

  const handleVerificationComplete = () => {
    if (!trustName.trim()) {
      toast({
        title: "Trust Name Required",
        description: "Please enter your chosen trust name",
        variant: "destructive"
      });
      return;
    }

    if (!ustpoChecked || !stateChecked) {
      toast({
        title: "Verification Required",
        description: "Please complete both USPTO and Secretary of State searches",
        variant: "destructive"
      });
      return;
    }

    setIsVerified(true);
    toast({
      title: "Trust Name Verified",
      description: "You can now proceed to the next step",
    });
  };

  const stateSearchLinks = [
    { state: "Alabama", url: "https://arc.sos.state.al.us/cgi/corpname.mbr/input" },
    { state: "Alaska", url: "https://www.corporations.alaska.gov/CBP/Main/Search/Entities" },
    { state: "Arizona", url: "https://ecorp.azcc.gov/EntitySearch/Index" },
    { state: "Arkansas", url: "https://www.sos.arkansas.gov/corps/search_all.php" },
    { state: "California", url: "https://bizfileonline.sos.ca.gov/search/business" },
    { state: "Colorado", url: "https://www.sos.state.co.us/biz/BusinessEntitySearchCriteria.do" },
    { state: "Connecticut", url: "https://service.ct.gov/business/s/onlinebusinesssearch" },
    { state: "Delaware", url: "https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx" },
    { state: "Florida", url: "https://search.sunbiz.org/Inquiry/CorporationSearch/ByName" },
    { state: "Georgia", url: "https://ecorp.sos.ga.gov/BusinessSearch" },
    { state: "Hawaii", url: "https://hbe.ehawaii.gov/documents/search.html" },
    { state: "Idaho", url: "https://sosbiz.idaho.gov/search/business" },
    { state: "Illinois", url: "https://www.ilsos.gov/corporatellc/" },
    { state: "Indiana", url: "https://inbiz.in.gov/Inbiz/Search" },
    { state: "Iowa", url: "https://sos.iowa.gov/search/business/search.aspx" },
    { state: "Kansas", url: "https://www.kansas.gov/bess/flow/main?execution=e1s1" },
    { state: "Kentucky", url: "https://web.sos.ky.gov/bussearchnew/" },
    { state: "Louisiana", url: "https://coraweb.sos.la.gov/CommercialSearch/CommercialSearch.aspx" },
    { state: "Maine", url: "https://icrs.informe.org/nei-sos-icrs/ICRS?MainPage=x" },
    { state: "Maryland", url: "https://egov.maryland.gov/BusinessExpress/EntitySearch" },
    { state: "Massachusetts", url: "https://corp.sec.state.ma.us/corpweb/CorpSearch/CorpSearch.aspx" },
    { state: "Michigan", url: "https://cofs.lara.state.mi.us/SearchApi/Search/Search" },
    { state: "Minnesota", url: "https://mblsportal.sos.state.mn.us/Business/SearchIndex" },
    { state: "Mississippi", url: "https://corp.sos.ms.gov/corp/portal/c/page/corpBusinessIdSearch/Portal.aspx" },
    { state: "Missouri", url: "https://www.sos.mo.gov/BusinessEntity/soskb/csearch.asp" },
    { state: "Montana", url: "https://biz.sosmt.gov/search/business" },
    { state: "Nebraska", url: "https://www.nebraska.gov/sos/corp/corpsearch.cgi" },
    { state: "Nevada", url: "https://esos.nv.gov/EntitySearch/OnlineEntitySearch" },
    { state: "New Hampshire", url: "https://quickstart.sos.nh.gov/online/BusinessInquire/" },
    { state: "New Jersey", url: "https://www.njportal.com/DOR/BusinessNameSearch" },
    { state: "New Mexico", url: "https://portal.sos.state.nm.us/BFS/online/CorporationBusinessSearch" },
    { state: "New York", url: "https://appext20.dos.ny.gov/corp_public/CORPSEARCH.ENTITY_SEARCH_ENTRY" },
    { state: "North Carolina", url: "https://www.sosnc.gov/online_services/search/by_title/_Business_Registration" },
    { state: "North Dakota", url: "https://firststop.sos.nd.gov/search/business" },
    { state: "Ohio", url: "https://www5.sos.state.oh.us/ords/f?p=100:7:0::NO:7::" },
    { state: "Oklahoma", url: "https://www.sos.ok.gov/corp/corpinquirysearch.aspx" },
    { state: "Oregon", url: "https://sos.oregon.gov/business/pages/find.aspx" },
    { state: "Pennsylvania", url: "https://www.corporations.pa.gov/search/corpsearch" },
    { state: "Rhode Island", url: "https://business.sos.ri.gov/CorpWeb/CorpSearch/CorpSearch.aspx" },
    { state: "South Carolina", url: "https://businessfilings.sc.gov/BusinessFiling/Entity/Search" },
    { state: "South Dakota", url: "https://sosentities.sd.gov/BusinessServices/Business/FilingSearch.aspx" },
    { state: "Tennessee", url: "https://tnbear.tn.gov/Ecommerce/FilingSearch.aspx" },
    { state: "Texas", url: "https://mycpa.cpa.state.tx.us/coa/" },
    { state: "Utah", url: "https://secure.utah.gov/bes/" },
    { state: "Vermont", url: "https://www.vtsosonline.com/online/BusinessInquire/" },
    { state: "Virginia", url: "https://sccefile.scc.virginia.gov/Find/Entity" },
    { state: "Washington", url: "https://ccfs.sos.wa.gov/#/" },
    { state: "West Virginia", url: "https://apps.sos.wv.gov/business/corporations/" },
    { state: "Wisconsin", url: "https://www.wdfi.org/apps/CorpSearch/Search.aspx" },
    { state: "Wyoming", url: "https://wyobiz.wy.gov/Business/FilingSearch.aspx" }
  ];

  const canProceed = trustName.trim() && ustpoChecked && stateChecked && isVerified;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Trust Name Verification
            {isVerified && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Verify your trust name is available and unique before proceeding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Why This Must Be Done First</div>
                <div className="text-sm text-blue-600">
                  You need your verified trust name to create your trust email address in the next steps. 
                  This ensures your trust, trustee, and trust email will be unique and avoids legal disputes.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Name Input */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Trust Name</CardTitle>
          <CardDescription>
            Enter your desired trust name. It should be unique and descriptive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trustName">Trust Name</Label>
            <Input
              id="trustName"
              value={trustName}
              onChange={(e) => setTrustName(e.target.value)}
              placeholder="e.g., SmithFamilyTrust, JohnsonEstatesTrust"
              className="text-lg"
            />
          </div>
          
          {trustName && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Your trust email will be:</div>
              <div className="font-mono text-sm">
                {trustName.toLowerCase().replace(/\s+/g, '')}erltrust@gmail.com
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                (ERL = Evangelical Revocable Living)
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* USPTO Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">1</span>
            USPTO Trademark Search
          </CardTitle>
          <CardDescription>
            Search the USPTO database to ensure no existing trademarks conflict with your trust name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <a
                href="https://tmsearch.uspto.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                USPTO TESS - Trademark Electronic Search System
              </a>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium mb-2">Search Instructions:</div>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click the link above to open USPTO TESS</li>
                <li>Click "Basic Word Mark Search (New User)"</li>
                <li>Enter your trust name in the search field</li>
                <li>Review all search results for conflicts</li>
                <li>Look for exact matches or similar names</li>
                <li>If no conflicts found, note "No conflicts found"</li>
                <li>Take a screenshot for your records (recommended)</li>
              </ol>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="ustpoCheck"
              checked={ustpoChecked}
              onCheckedChange={(checked) => setUstpoChecked(checked as boolean)}
            />
            <Label htmlFor="ustpoCheck" className="text-sm">
              I have checked the USPTO Trademark Database and found no conflicts
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Secretary of State Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">2</span>
            Secretary of State Business Search
          </CardTitle>
          <CardDescription>
            Search your state's business database to ensure no existing business entities use your trust name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-medium mb-2">Search Instructions:</div>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click your state's link below</li>
              <li>Search for your trust name</li>
              <li>Check: LLCs, Corporations, Trusts, Partnerships</li>
              <li>Verify no entity is using your exact trust name</li>
              <li>If available, note "Name available in [Your State]"</li>
              <li>Take a screenshot for your records (recommended)</li>
            </ol>
          </div>

          {/* State Links Grid */}
          <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {stateSearchLinks.map((state) => (
                <a
                  key={state.state}
                  href={state.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {state.state}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="stateCheck"
              checked={stateChecked}
              onCheckedChange={(checked) => setStateChecked(checked as boolean)}
            />
            <Label htmlFor="stateCheck" className="text-sm">
              I have checked my Secretary of State's business database and found no conflicts
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Verification Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">3</span>
            Complete Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isVerified ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Name Not Available?</div>
                    <div className="text-sm text-yellow-600">
                      If your chosen name is already in use, select an alternative name and repeat both searches above.
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleVerificationComplete}
                disabled={!trustName.trim() || !ustpoChecked || !stateChecked}
                className="w-full"
                size="lg"
              >
                I have verified my trust name is available and unique
              </Button>
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">Trust Name Verified!</div>
                  <div className="text-sm text-green-600">
                    "{trustName}" is verified as available and unique
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={!onPrev}>
          Previous
        </Button>
        <Button 
          onClick={() => onNext({ 
            trustName,
            ustpoChecked,
            stateChecked,
            isVerified,
            trustEmail: trustName ? `${trustName.toLowerCase().replace(/\s+/g, '')}erltrust@gmail.com` : ''
          })} 
          disabled={!canProceed}
          className={canProceed ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {canProceed ? "Continue to Email Setup" : "Complete Verification First"}
        </Button>
      </div>
    </div>
  );
};

export default StepTrustName;