import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  FormGroup,
} from 'reactstrap';
import { avLogMessagesApi, avRegionsApi } from '@availity/api-axios';
import { useToggle } from '@availity/hooks';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { AvSelectField } from '@availity/reactstrap-validation-select';
import FeedbackButton from './FeedbackButton';

const FeedbackForm = ({
  name,
  onClose,
  faceOptions,
  aboutOptions,
  onFeedbackSent,
  prompt,
  additionalComments,
}) => {
  const [active, setActive] = useState(null);
  const [invalid, toggleInvalid] = useToggle(false);
  const [sent, toggleSent] = useToggle(false);

  const sendFeedback = async values => {
    if (!active && !invalid) {
      toggleInvalid();
      return;
    }
    const response = await avRegionsApi.getCurrentRegion();

    await avLogMessagesApi.info({
      surveyId: `${name.replace(/\s/g, '_')}_Smile_Survey`,
      smileLocation: `${name}`,
      smile: `icon-${active}`,
      feedback: { ...values },
      url: window.location.href,
      region: response.data.regions[0] && response.data.regions[0].id,
      userAgent: window.navigator.userAgent,
      submitTime: new Date(),
    });

    if (onFeedbackSent) {
      onFeedbackSent({ active, values });
    }
    toggleSent();

    if (invalid) {
      toggleInvalid();
    }
  };

  return sent ? (
    <ModalHeader className="d-flex justify-content-center">
      Thank you for your feedback.
    </ModalHeader>
  ) : (
    <React.Fragment>
      <ModalHeader>
        {prompt || `Tell us what you think about ${name}`}
      </ModalHeader>
      <AvForm
        name="feedack-form"
        id="feedback-form"
        data-testid="feedback-form"
        onValidSubmit={(event, values) => sendFeedback(values)}
      >
        <ModalBody>
          <FormGroup
            size="lg"
            id="face-options"
            data-testid="face-options"
            className="d-flex flex-row justify-content-between"
          >
            {faceOptions.map(option => (
              <FeedbackButton
                style={{ flex: 1, margin: '0 2% 0 2%' }}
                key={option.icon}
                icon={option.icon}
                iconSize="2x"
                active={active && active.icon}
                onClick={() => setActive(option)}
              >
                {option.description}
              </FeedbackButton>
            ))}
          </FormGroup>
          {active ? (
            <React.Fragment>
              {aboutOptions.length > 0 && (
                <AvSelectField
                  name="feedbackApp"
                  id="about-options"
                  data-testid="about-options"
                  placeholder="This is about..."
                  options={aboutOptions}
                  required
                />
              )}
              <AvField
                type="textarea"
                name="feedback"
                placeholder={
                  (active && active.placeholder) ||
                  'Feedback? Requests? Defects?'
                }
                style={{ resize: 'none' }}
                rows="2"
                validate={{
                  required: {
                    value: true,
                    errorMessage: 'This field is required.',
                  },
                  maxLength: { value: 200 },
                }}
              />
              {additionalComments && (
                <AvField
                  type="textarea"
                  name="additionalComments"
                  placeholder="Additional Comments... (Optional)"
                  style={{ resize: 'none' }}
                  rows="2"
                  validate={{
                    required: { value: false },
                    maxLength: { value: 200 },
                  }}
                />
              )}
            </React.Fragment>
          ) : null}
        </ModalBody>

        <ModalFooter>
          {onClose ? (
            <Button onClick={onClose} color="secondary">
              Close
            </Button>
          ) : null}
          <Button type="submit" color="primary" disabled={!active}>
            Send Feedback
          </Button>
        </ModalFooter>
      </AvForm>
    </React.Fragment>
  );
};

FeedbackForm.propTypes = {
  name: PropTypes.string.isRequired,
  onFeedbackSent: PropTypes.func,
  faceOptions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      description: PropTypes.string,
      placeholder: PropTypes.string,
    })
  ),
  aboutOptions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  onClose: PropTypes.func,
  prompt: PropTypes.string,
  additionalComments: PropTypes.bool,
};

FeedbackForm.defaultProps = {
  faceOptions: [
    {
      icon: 'smile',
      description: 'Smiley face',
      placeholder: 'What do you like?',
    },
    {
      icon: 'meh',
      description: 'Meh face',
      placeholder: 'What would you improve?',
    },
    {
      icon: 'frown',
      description: 'Frowny face',
      placeholder: "What don't you like?",
    },
  ],
  aboutOptions: [],
  additionalComments: false,
};

export default FeedbackForm;
