export default {
        'update:proptocalculate' (state, {prop, value}) {
            state.attributes[prop] = value;
        }
}
