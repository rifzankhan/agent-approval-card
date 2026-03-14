import type { Preview } from '@storybook/react';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    backgrounds: {
      default: 'warm',
      values: [
        { name: 'warm', value: '#efe5d6' },
        { name: 'graphite', value: '#121414' }
      ]
    }
  }
};

export default preview;
