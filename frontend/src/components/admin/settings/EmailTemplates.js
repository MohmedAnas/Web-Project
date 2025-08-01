import React, { useState, useEffect } from 'react';

const EmailTemplates = ({ onSave }) => {
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const templateTypes = [
    { key: 'welcome', name: 'Welcome Email', description: 'Sent to new students upon registration' },
    { key: 'fee_reminder', name: 'Fee Reminder', description: 'Sent when fees are due' },
    { key: 'attendance_alert', name: 'Attendance Alert', description: 'Sent when attendance is low' },
    { key: 'certificate_ready', name: 'Certificate Ready', description: 'Sent when certificate is issued' },
    { key: 'course_completion', name: 'Course Completion', description: 'Sent when student completes a course' },
    { key: 'password_reset', name: 'Password Reset', description: 'Sent for password reset requests' }
  ];

  useEffect(() => {
    // Initialize with default templates
    setTemplates({
      welcome: {
        subject: 'Welcome to R.B Computer!',
        body: `Dear {{student_name}},

Welcome to R.B Computer! We're excited to have you join our training program.

Your registration details:
- Student ID: {{student_id}}
- Course: {{course_name}}
- Batch: {{batch_name}}
- Start Date: {{start_date}}

Please keep this information for your records. If you have any questions, feel free to contact us.

Best regards,
R.B Computer Team

Contact: {{contact_email}}
Phone: {{contact_phone}}`
      },
      fee_reminder: {
        subject: 'Fee Payment Reminder - R.B Computer',
        body: `Dear {{student_name}},

This is a friendly reminder that your fee payment is due.

Payment Details:
- Amount Due: {{amount_due}}
- Due Date: {{due_date}}
- Course: {{course_name}}

Please make your payment at your earliest convenience to avoid any interruption in your classes.

You can pay online through our portal or visit our office during business hours.

Thank you for your attention to this matter.

Best regards,
R.B Computer Team

Contact: {{contact_email}}
Phone: {{contact_phone}}`
      },
      attendance_alert: {
        subject: 'Attendance Alert - R.B Computer',
        body: `Dear {{parent_name}},

We wanted to inform you about {{student_name}}'s attendance in our training program.

Attendance Summary:
- Current Attendance: {{attendance_percentage}}%
- Classes Attended: {{classes_attended}}
- Total Classes: {{total_classes}}
- Course: {{course_name}}

Regular attendance is crucial for academic success. Please ensure {{student_name}} attends classes regularly.

If there are any concerns or issues, please don't hesitate to contact us.

Best regards,
R.B Computer Team

Contact: {{contact_email}}
Phone: {{contact_phone}}`
      },
      certificate_ready: {
        subject: 'Your Certificate is Ready! - R.B Computer',
        body: `Dear {{student_name}},

Congratulations! Your certificate for {{course_name}} is now ready.

Certificate Details:
- Course: {{course_name}}
- Completion Date: {{completion_date}}
- Grade: {{grade}}
- Certificate Number: {{certificate_number}}

You can download your certificate from the student portal or collect it from our office.

We're proud of your achievement and wish you success in your future endeavors.

Best regards,
R.B Computer Team

Contact: {{contact_email}}
Phone: {{contact_phone}}`
      },
      course_completion: {
        subject: 'Course Completion Congratulations! - R.B Computer',
        body: `Dear {{student_name}},

Congratulations on successfully completing {{course_name}}!

Course Summary:
- Course: {{course_name}}
- Duration: {{course_duration}}
- Final Attendance: {{final_attendance}}%
- Completion Date: {{completion_date}}

Your certificate will be processed and made available shortly. We'll notify you once it's ready.

Thank you for choosing R.B Computer for your training needs. We wish you all the best in your career.

Best regards,
R.B Computer Team

Contact: {{contact_email}}
Phone: {{contact_phone}}`
      },
      password_reset: {
        subject: 'Password Reset Request - R.B Computer',
        body: `Dear {{user_name}},

We received a request to reset your password for your R.B Computer account.

To reset your password, please click the link below:
{{reset_link}}

This link will expire in 24 hours for security reasons.

If you didn't request this password reset, please ignore this email or contact us if you have concerns.

Best regards,
R.B Computer Team

Contact: {{contact_email}}
Phone: {{contact_phone}}`
      }
    });
  }, []);

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey);
  };

  const handleSubjectChange = (value) => {
    setTemplates(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        subject: value
      }
    }));
  };

  const handleBodyChange = (value) => {
    setTemplates(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        body: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      await onSave(templates);
      setMessage('Email templates saved successfully!');
    } catch (error) {
      setMessage('Error saving templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const template = templates[selectedTemplate];
    if (template) {
      alert(`Subject: ${template.subject}\n\nBody:\n${template.body}`);
    }
  };

  const availableVariables = {
    welcome: ['{{student_name}}', '{{student_id}}', '{{course_name}}', '{{batch_name}}', '{{start_date}}', '{{contact_email}}', '{{contact_phone}}'],
    fee_reminder: ['{{student_name}}', '{{amount_due}}', '{{due_date}}', '{{course_name}}', '{{contact_email}}', '{{contact_phone}}'],
    attendance_alert: ['{{parent_name}}', '{{student_name}}', '{{attendance_percentage}}', '{{classes_attended}}', '{{total_classes}}', '{{course_name}}', '{{contact_email}}', '{{contact_phone}}'],
    certificate_ready: ['{{student_name}}', '{{course_name}}', '{{completion_date}}', '{{grade}}', '{{certificate_number}}', '{{contact_email}}', '{{contact_phone}}'],
    course_completion: ['{{student_name}}', '{{course_name}}', '{{course_duration}}', '{{final_attendance}}', '{{completion_date}}', '{{contact_email}}', '{{contact_phone}}'],
    password_reset: ['{{user_name}}', '{{reset_link}}', '{{contact_email}}', '{{contact_phone}}']
  };

  const currentTemplate = templates[selectedTemplate] || { subject: '', body: '' };
  const currentVariables = availableVariables[selectedTemplate] || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Email Templates</h2>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Templates</h3>
          <div className="space-y-2">
            {templateTypes.map((template) => (
              <button
                key={template.key}
                onClick={() => handleTemplateChange(template.key)}
                className={`w-full text-left p-3 rounded-md border transition-colors ${
                  selectedTemplate === template.key
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-gray-500 mt-1">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Edit Template: {templateTypes.find(t => t.key === selectedTemplate)?.name}
            </h3>
            <div className="space-x-2">
              <button
                onClick={handlePreview}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line
              </label>
              <input
                type="text"
                value={currentTemplate.subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email subject..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body
              </label>
              <textarea
                value={currentTemplate.body}
                onChange={(e) => handleBodyChange(e.target.value)}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Enter email body..."
              />
            </div>
          </div>
        </div>

        {/* Available Variables */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Variables</h3>
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-sm text-gray-600 mb-3">
              Click to copy variables to use in your template:
            </p>
            <div className="space-y-2">
              {currentVariables.map((variable) => (
                <button
                  key={variable}
                  onClick={() => navigator.clipboard.writeText(variable)}
                  className="block w-full text-left px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 font-mono"
                  title="Click to copy"
                >
                  {variable}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Common Variables</h4>
              <div className="space-y-1">
                {['{{contact_email}}', '{{contact_phone}}'].map((variable) => (
                  <button
                    key={variable}
                    onClick={() => navigator.clipboard.writeText(variable)}
                    className="block w-full text-left px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 font-mono"
                    title="Click to copy"
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Tips:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Use variables in double curly braces</li>
              <li>• Variables will be replaced with actual values</li>
              <li>• Keep subject lines under 50 characters</li>
              <li>• Test templates before using</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplates;
