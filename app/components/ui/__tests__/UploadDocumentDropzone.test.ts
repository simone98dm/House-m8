/**
 * UploadDocumentDropzone Component Tests
 * Covers the drag/drop + click-to-pick zone extracted from UploadDocument.vue.
 * UploadDocument.test.ts still covers the end-to-end flow (validation, list,
 * upload); this file exercises the dropzone's own contract in isolation:
 * it only emits raw File[] selections, it never validates itself.
 */

import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import UploadDocumentDropzone from '~/components/ui/UploadDocumentDropzone.vue';

function makeFile(name = 'doc.pdf') {
  return new File(['x'], name, { type: 'application/pdf' });
}

describe('UploadDocumentDropzone', () => {
  it('renders the upload zone as a keyboard-operable button', async () => {
    const wrapper = await mountSuspended(UploadDocumentDropzone);
    const zone = wrapper.find('.upload-zone');
    expect(zone.attributes('role')).toBe('button');
    expect(zone.attributes('tabindex')).toBe('0');
  });

  it('sets tabindex to -1 when disabled', async () => {
    const wrapper = await mountSuspended(UploadDocumentDropzone, {
      props: { disabled: true },
    });
    expect(wrapper.find('.upload-zone').attributes('tabindex')).toBe('-1');
  });

  it('emits filesSelected with the raw picked files, no validation', async () => {
    const wrapper = await mountSuspended(UploadDocumentDropzone);
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [makeFile('anything.exe')],
      configurable: true,
    });
    await input.trigger('change');

    expect(wrapper.emitted('filesSelected')).toBeTruthy();
    const [emittedFiles] = wrapper.emitted('filesSelected')![0] as [File[]];
    expect(emittedFiles[0]?.name).toBe('anything.exe');
  });

  it('emits filesSelected on drop', async () => {
    const wrapper = await mountSuspended(UploadDocumentDropzone);
    const file = makeFile('dropped.pdf');
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [file] },
    });
    await wrapper.find('.upload-zone').element.dispatchEvent(dropEvent);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('filesSelected')).toBeTruthy();
  });

  it('does not emit on drop when disabled', async () => {
    const wrapper = await mountSuspended(UploadDocumentDropzone, {
      props: { disabled: true },
    });
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [makeFile()] },
    });
    await wrapper.find('.upload-zone').element.dispatchEvent(dropEvent);

    expect(wrapper.emitted('filesSelected')).toBeFalsy();
  });

  it('opens the file picker on Enter/Space keydown', async () => {
    const wrapper = await mountSuspended(UploadDocumentDropzone);
    const zone = wrapper.find('.upload-zone');
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => {});

    await zone.trigger('keydown', { key: 'Enter' });

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
