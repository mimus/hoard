<template>
  <div>
    <v-text-field prepend-icon="attach_file" single-line
                  v-model="filename" :label="label" :required="required"
                  @click.native="onFocus"
                  :disabled="disabled" ref="fileTextField"></v-text-field>
    <input type="file" :accept="accept" :multiple="multiple" :disabled="disabled"
           ref="fileInput" @change="onFileChange">
  </div>
</template>

<script>
/* Vuetify does not yet have a file input component - coming in Front End pack later in 2018.
   This implementation from https://gist.github.com/dohomi/2bba9e2905d00cd1cec9c09cfd87bd10
   linked from https://github.com/vuetifyjs/vuetify/issues/238
*/
export default {
  props: {
    value: {
      type: [Array, String]
    },
    accept: {
      type: String,
      default: '*'
    },
    label: {
      type: String,
      default: 'choose_file'
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      filename: ''
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (v) {
        this.filename = v
      }
    }
  },
  methods: {
    getFormData (files) {
      const forms = []
      for (const file of files) {
        const form = new FormData()
        form.append('data', file, file.name)
        forms.push(form)
      }
      return forms
    },
    onFocus () {
      if (!this.disabled) {
        this.$refs.fileInput.click()
      }
    },
    onFileChange ($event) {
      const files = $event.target.files || $event.dataTransfer.files
      const form = this.getFormData(files)
      if (files) {
        if (files.length > 0) {
          this.filename = [...files].map(file => file.name).join(', ')
        } else {
          this.filename = null
        }
      } else {
        this.filename = $event.target.value.split('\\').pop()
      }
      this.$emit('input', this.filename)
      this.$emit('formData', form)
    }
  }
}
</script>

<style scoped>
  input[type=file] {
    position: absolute;
    left: -99999px;
  }
</style>
