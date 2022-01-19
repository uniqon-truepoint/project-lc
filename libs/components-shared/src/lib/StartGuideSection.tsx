import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react';
import { Step, StepLabel } from '@material-ui/core';
import { guideConditionStore } from '@project-lc/stores';
import { ChakraStepper } from './guide/ChakraStepper';
import { IntroSection } from './guide/IntroSection';

interface StartGuideStep {
  label: string;
  component: JSX.Element;
}
type StartGuideSteps = StartGuideStep[];

export function StartGuideSection({
  isOpen,
  onClose,
  steps,
}: Pick<ModalProps, 'isOpen' | 'onClose'> & {
  steps: StartGuideSteps;
}): JSX.Element {
  // 다음 단계 가능여부
  const { condition, completeStep, setCondition } = guideConditionStore();

  const [introduction, setIntroduction] = useState<boolean>(true);
  const handleIntroSkip = (): void => {
    setIntroduction(false);
  };
  const handleIntroReset = (): void => {
    setIntroduction(true);
  };

  // 가이드 Stepper
  const [activeStep, setActiveStep] = useState(0);
  const handleNext = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setCondition(false);
  };
  const handleBack = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleStepReset = (): void => {
    setActiveStep(0);
  };

  function getStepComponent(step: number): React.ReactNode {
    return steps[step].component;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        handleIntroReset();
        handleStepReset();
      }}
      size="6xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>크크쇼 시작가이드</ModalHeader>
        <ModalCloseButton />
        <ModalBody mx="5">
          {/* 가이드 Stepper */}
          {introduction ? (
            <IntroSection />
          ) : (
            <>
              <ChakraStepper activeStep={activeStep} alternativeLabel>
                {steps.map((step) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </ChakraStepper>
              {/* 단계별 컴포넌트 */}
              {getStepComponent(activeStep)}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              onClick={(): void => {
                if (introduction) onClose();
                if (activeStep === 0) {
                  handleIntroReset();
                  handleStepReset();
                } else handleBack();
              }}
            >
              {introduction ? '닫기' : '이전'}
            </Button>
            <Button
              colorScheme="blue"
              onClick={(): void => {
                if (introduction) {
                  handleIntroSkip();
                  setCondition(false);
                  return;
                }
                if (activeStep === steps.length - 1) {
                  onClose();
                  handleStepReset();
                } else {
                  handleNext();
                }
              }}
              disabled={!condition}
            >
              다음
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
