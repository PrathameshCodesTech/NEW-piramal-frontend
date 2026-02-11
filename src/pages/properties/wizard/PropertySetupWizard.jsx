import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../../../components/ui/Stepper";
import PageHeader from "../../../components/ui/PageHeader";
import WizardSiteStep from "./WizardSiteStep";
import WizardAmenityStep from "./WizardAmenityStep";
import WizardTowerStep from "./WizardTowerStep";
import WizardFloorStep from "./WizardFloorStep";
import WizardUnitStep from "./WizardUnitStep";
import WizardAssetStep from "./WizardAssetStep";

const STEPS = [
  { label: "Site", subtitle: "Select or create site" },
  { label: "Amenities", subtitle: "Configure amenities" },
  { label: "Towers", subtitle: "Add towers" },
  { label: "Floors", subtitle: "Define floors" },
  { label: "Units", subtitle: "Add units" },
  { label: "Assets", subtitle: "Assign assets" },
];

export default function PropertySetupWizard() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [siteId, setSiteId] = useState(null);

  const goNext = () => {
    const next = Math.min(activeStep + 1, STEPS.length - 1);
    setActiveStep(next);
  };

  const goBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const handleSiteSelected = (id) => {
    setSiteId(id);
    goNext();
  };

  const handleFinish = () => navigate("/properties");

  return (
    <div>
      <PageHeader
        title="Property Setup Wizard"
        subtitle="Follow each step to set up your property"
        backTo="/properties"
      />

      <Stepper
        steps={STEPS}
        activeStep={activeStep}
        onStepClick={(i) => setActiveStep(i)}
      />

      <div className="mt-4">
        {activeStep === 0 && <WizardSiteStep onSelected={handleSiteSelected} onNext={goNext} />}
        {activeStep === 1 && <WizardAmenityStep siteId={siteId} onNext={goNext} onBack={goBack} />}
        {activeStep === 2 && <WizardTowerStep siteId={siteId} onNext={goNext} onBack={goBack} />}
        {activeStep === 3 && <WizardFloorStep siteId={siteId} onNext={goNext} onBack={goBack} />}
        {activeStep === 4 && <WizardUnitStep siteId={siteId} onNext={goNext} onBack={goBack} />}
        {activeStep === 5 && <WizardAssetStep siteId={siteId} onFinish={handleFinish} onBack={goBack} />}
      </div>
    </div>
  );
}
