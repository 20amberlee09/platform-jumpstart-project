import StepNDA from './StepNDA';
import StepPayment from './StepPayment';
import StepIdentity from './StepIdentity';
import StepTrustName from './StepTrustName';
import StepOrdination from './StepOrdination';
import StepBarcode from './StepBarcode';
import StepGmailSetup from './StepGmailSetup';
import StepVerificationTools from './StepVerificationTools';
import StepDocumentGeneration from './StepDocumentGeneration';
import DocumentDelivery from './DocumentDelivery';

export const moduleRegistry: Record<string, React.ComponentType<any>> = {
  StepNDA,
  StepPayment,
  StepIdentity,
  StepTrustName,
  StepOrdination,
  StepBarcode,
  StepGmailSetup,
  StepVerificationTools,
  StepDocumentGeneration,
  DocumentDelivery
};