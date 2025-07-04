import StepNDA from './StepNDA';
import StepPayment from './StepPayment';
import Step1Identity from './Step1Identity';
import Step2Trust from './Step2Trust';
import Step3DocumentAssembly from './Step3DocumentAssembly';
import StepSignatures from './StepSignatures';
import StepReview from './StepReview';
import StepBasicConfig from './StepBasicConfig';

export const moduleRegistry: Record<string, React.ComponentType<any>> = {
  StepNDA,
  StepPayment,
  Step1Identity,
  Step2Trust,
  Step3DocumentAssembly,
  StepSignatures,
  StepReview,
  StepBasicConfig
};