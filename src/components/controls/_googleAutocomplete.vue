<template>
  <div class="p-component p-inputwrapper">  
    <input ref="autocomplete_input" type="text" :class="classname" class="p-inputtext" placeholder="Start typing..."
      v-model="autocompleteText" @focus="onFocus()" @blur="onBlur()" @change="onChange" @keypress="onKeyPress"
      @keyup="onKeyUp"/> 
  </div>   
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { useApplicationStore } from '@/stores/application'
import { useDebounceFn } from "@vueuse/core"
const { getFields, setFields, saveFields } = useApplicationStore()
const emit = defineEmits(['change', 'save', 'validate'])

const ADDRESS_COMPONENTS = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  administrative_area_level_2: 'county',
  sublocality_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name',
};

const CITIES_TYPE = ['locality', 'administrative_area_level_3'];
const REGIONS_TYPE = [
  'locality',
  'sublocality',
  'postal_code',
  'country',
  'administrative_area_level_1',
  'administrative_area_level_2',
];

const props = defineProps({
  field: {
    type: Object,
    default(rawProps) {
      return {}
    }
  },
  val: {
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  this_field: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  classes: {
    type: String,
    default: ''
  },
  inputClasses: {
    type: String,
    default: ''
  },
  types: {
      type: String,
      default: 'address',
  },
  country: {
      type: [String, Array],
      default: null,
  },
  enableGeolocation: {
    type: Boolean,
    default: false,
  },
  geolocationOptions: {
      type: Object,
      default: null,
  }
})

const autocomplete_input = ref(null);
const autocompleteText = ref('');
const raw = ref(null);
const geolocation = ref({
  geocoder: null,
  loc: null,
  position: null,
});

watch(() => autocompleteText, function (newVal, oldVal) {
  emit('inputChange', { newVal, oldVal })
});

watch(() => props.val, function (newVal, oldVal) {
  autocompleteText.value = newVal
},
  { immediate: true }
);

onMounted(() => {
  autocomplete_input.value = new google.maps.places.Autocomplete(
    autocomplete_input.value,
    { componentRestrictions: { country: 'nz' }, types: ['address'] }
  );
  autocomplete_input.value.setFields([
    'address_components',
    'geometry',
    'formatted_address',
  ]);
  autocomplete_input.value.addListener('place_changed', onPlaceChanged);
});


function onPlaceChanged() {
  autocompleteText.value = autocomplete_input.value;
  onChange();
}

function onFocus() {
  biasAutocompleteLocation();
  emit('focus');
}

function onBlur() {
  emit('blur');
  if (typeof autocompleteText.value === 'object' && !autocompleteText?.value?.value) {
    autocompleteText.value.value = getFields[props.field.name].value
  }
  else if (typeof autocompleteText.value === 'string') {
    autocompleteText.value = getFields[props.field.name].value
  }
}

function onChange() {
  if (autocompleteText.value && typeof autocompleteText.value === 'object') {
    emit('change', autocompleteText.value.value);
    setFields({ [props.field.name]: autocompleteText.value.value })
    saveFields()
  }
}

function onKeyPress(event) {
  emit('keypress', event);
}

function onKeyUp(event) {
  emit('keyup', event);
}

function clear() {
  autocompleteText.value = '';
}

function focus() {
  autocomplete_input.focus();
}

function blur() {
  autocomplete_input.blur();
}

function update(value) {
  autocompleteText.value = value;
}

function updateCoordinates(value) {
  if (!value && !(value.lat || value.lng)) return;
  if (!geolocation.value.geocoder) { geolocation.valuegeocoder = new google.maps.Geocoder(); }
  geolocation.value.geocoder.geocode(
    { location: value },
    (results, status) => {
      if (status === 'OK') {
        results = filterGeocodeResultTypes(results);
        if (results[0]) {
          emit(
            'placechanged',
            formatResult(results[0]),
            results[0]
          );
          update(results[0].formatted_address);
        } else {
          emit('error', 'no result for provided coordinates');
        }
      } else {
        emit('error', 'error getting address from coords');
      }
    }
  );
}

function geolocate() {
  updateGeolocation((geolocation, position) => {
    updateCoordinates(geolocation);
  });
}

function updateGeolocation(callback = null) {
  if (navigator.geolocation) {
    let options = {};
    if (geolocationOptions.value)
      Object.assign(options, geolocationOptions.value);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.geolocation.loc = geolocation;
        this.geolocation.position = position;

        if (callback) callback(geolocation, position);
      },
      (err) => {
        emit('error', 'Cannot get Coordinates from navigator', err);
      },
      options
    );
  }
}

function biasAutocompleteLocation() {
  if (props.enableGeolocation.value) {
    updateGeolocation((geolocation, position) => {
      let circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy,
      });
      autocomplete_input.value.setBounds(circle.getBounds());
    });
  }
}

function formatResult(place) {
  let returnData = {};
  for (let i = 0; i < place.address_components.length; i++) {
    let addressType = place.address_components[i].types[0];

    if (ADDRESS_COMPONENTS[addressType]) {
      let val =
        place.address_components[i][ADDRESS_COMPONENTS[addressType]];
      returnData[addressType] = val;
    }
  }

  returnData['latitude'] = place.geometry.location.lat();
  returnData['longitude'] = place.geometry.location.lng();
  return returnData;
}

function filterGeocodeResultTypes(results) {
  if (!results || !types) return results;
  let output = [];
  let types = [this.types];
  if (types.includes('(cities)')) types = types.concat(CITIES_TYPE);
  if (types.includes('(regions)')) types = types.concat(REGIONS_TYPE);

  for (let r of results) {
    for (let t of r.types) {
      if (types.includes(t)) {
        output.push(r);
        break;
      }
    }
  }
  return output;
}
</script>

<script>
export default {
  name: 'GoogleAutocomplete',
}

</script>