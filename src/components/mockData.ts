import { ChecklistData } from './types';

// Mock data for testing the Checklist UI
// This will be replaced by parsed markdown data from the parser

export const mockChecklistData: ChecklistData = {
  title: 'Demo Checklist',
  sections: [
    {
      id: 'section-1',
      title: 'Setup & Preparation',
      items: [
        {
          id: 'item-1-1',
          text: 'Open the application',
          isCompleted: true,
        },
        {
          id: 'item-1-2',
          text: 'Load the demo file',
          isCompleted: true,
        },
        {
          id: 'item-1-3',
          text: 'Verify all systems are ready',
          isCompleted: false,
          isActive: true,
          children: [
            {
              id: 'item-1-3-1',
              text: 'Check network connection',
              isCompleted: true,
            },
            {
              id: 'item-1-3-2',
              text: 'Verify API endpoints',
              isCompleted: false,
            },
          ],
        },
      ],
    },
    {
      id: 'section-2',
      title: 'Core Demo Steps',
      items: [
        {
          id: 'item-2-1',
          text: 'Show the main dashboard',
          isCompleted: false,
        },
        {
          id: 'item-2-2',
          text: 'Navigate to settings',
          isCompleted: false,
          children: [
            {
              id: 'item-2-2-1',
              text: 'Update user preferences',
              isCompleted: false,
            },
            {
              id: 'item-2-2-2',
              text: 'Configure notifications',
              isCompleted: false,
              children: [
                {
                  id: 'item-2-2-2-1',
                  text: 'Email notifications',
                  isCompleted: false,
                },
                {
                  id: 'item-2-2-2-2',
                  text: 'Push notifications',
                  isCompleted: false,
                },
              ],
            },
          ],
        },
        {
          id: 'item-2-3',
          text: 'Demonstrate real-time updates',
          isCompleted: false,
        },
      ],
    },
    {
      id: 'section-3',
      title: 'Wrap Up',
      items: [
        {
          id: 'item-3-1',
          text: 'Answer questions',
          isCompleted: false,
        },
        {
          id: 'item-3-2',
          text: 'Share resources',
          isCompleted: false,
        },
      ],
    },
  ],
};

