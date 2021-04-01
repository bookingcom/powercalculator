<template id="pc-overlay">
  <div>
    <button v-on:click="openOverlay">More information</button>

    <div
      class="pc-overlay-wrapper"
      ref="pc-overlay-wrapper"
      v-on:click="noBubblingCloseOverlay"
      v-show="isoverlayopen"
    >
      <div class="pc-info pc-overlay-text">
        <p>
          For how long should you run your experiment? What is the impact that
          you would be able to detect in 2, 4, 8 weeks of runtime? Statistical
          power has the answers!
        </p>

        <p>
          Assuming that the effect exists, statistical power is the probability
          that your experiment will detect it.
        </p>

        <p>
          Use the power calculator <strong>before</strong> the start of an
          experiment.
        </p>

        <ol>
          <li>
            If you know the impact you’re targeting, you can estimate how many
            visitors you would need to detect it or for how long you should run
            your experiment.
          </li>
          <li>
            If you know the number of visitors (either daily or total), you can
            estimate what minimum impact you would be able to detect.
          </li>
        </ol>
        <p>
          The power calculator allows you to calculate two different outcomes:
        </p>
        <ul>
          <li>
            Sample size: what kind of total sample size do you need to detect
            impact, given base rate and impact. Sample size here refers to the
            total number of visitors over all variants.
          </li>
          <li>
            Impact: what minimal effect size can you detect given base rate and
            sample size. This outcome is useful when you cannot impact sample
            size by running your experiment longer (e.g. in partner-facing
            products).
          </li>
        </ul>
        <p>
          This requires that you know the base rate (e.g. the conversion rate in
          the base variant) and are able to estimate either 1) the size of the
          impact of your experiment or 2) the number of visitors. This can be
          based on A/A experiments or by looking at the base in an A/B
          experiment in the same area. The potential impact can be based on
          previous AB experiments in your area.
        </p>
        <p>Some things to keep in mind:</p>
        <ul>
          <li>
            Currently the tool is limited to two variants (base and variant).
          </li>
          <li>
            If the true impact and/or traffic is larger than your estimation,
            you will be more likely to detect it.
          </li>
          <li>
            If running your experiment longer increases the number of visitors
            (e.g., in customer-facing products), then calculating the sample
            size will give you the minimum runtime for your experiment. It is
            very important to decide on the runtime and commit to it: if we
            don't do that, then we will increase the false positive rate of our
            experiments beyond the standard 10% at Booking.com.
          </li>
          <li>
            If the sample size has an upper limit, like in many partner-facing
            products, then you can use the power calculator to find the minimum
            detectable impact. For these types of experimentation, it is very
            important to still decide on a runtime, even when arbitrary. Again,
            if we do not commit to a particular experiment runtime before
            starting an experiment, then we will increase the false positive
            rate of our experiments beyond the standard 10% at Booking.com. This
            calculator assumes that the traffic is equally split between all
            variants (e.g. 50%/50%). If your experiment has multiple stages,
            then the values that you enter (e.g. base rate, sample size) should
            be for the decision making stage.
          </li>
          <li>
            For customer-facing experiments, runtime should be a based on full
            week cycles, e.g. 7, 14, 21, etc days. See
            <a
              href="https://www.google.com/url?q=https://wiki.booking.com/pages/viewpage.action?pageId%3D317526288&amp;sa=D&amp;ust=1510155767728000&amp;usg=AFQjCNEBPONnocKI29b0FniJPNElqKcMZA"
              >this wiki page</a
            >
            for more details.
          </li>
          <li>
            The calculator also requires values for the false positive rate and
            power, which at Booking.com are set at 10% and 80% respectively. Do
            not &nbsp;change these values unless you have an advanced
            understanding of experimentation.
          </li>
          <li>
            Note that you cannot meaningfully use this power calculator to
            determine the power of an experiment after it has been started. See
            <a
              href="https://www.google.com/url?q=http://www.tc.umn.edu/~alonso/Hoenig_AmericanStat_2001.pdf&amp;sa=D&amp;ust=1510155767729000&amp;usg=AFQjCNGSC5HLs1MayGDXdukvUiefE8-Xpw"
              >this technical paper</a
            >
            or
            <a
              href="https://www.google.com/url?q=https://en.wikipedia.org/wiki/Statistical_power%23A_priori_vs._post_hoc_analysis&amp;sa=D&amp;ust=1510155767730000&amp;usg=AFQjCNHb-ejFukphEfKhr7QFMr-n637SQw"
              >this wikipedia summary</a
            >
            for more information.
          </li>
        </ul>
      </div>
      <button v-on:click="closeOverlay" class="pc-overlay-close">
        <svg
          version="1.1"
          baseProfile="full"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50%" cy="50%" r="50%" fill="#e2e6eb" />

          <line
            x1="30%"
            y1="30%"
            x2="70%"
            y2="70%"
            stroke-width="2"
            stroke="#5d5f63"
          />
          <line
            x1="70%"
            y1="30%"
            x2="30%"
            y2="70%"
            stroke-width="2"
            stroke="#5d5f63"
          />

          <desc>Close</desc>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  template: '#pc-overlay',
  props: ['isoverlayopen'],
  data() {
    return {}
  },
  methods: {
    noBubblingCloseOverlay(e) {
      if (e.target == this.$refs['pc-overlay-wrapper']) {
        this.closeOverlay()
      }
    },
    openOverlay() {
      this.$emit('update:isoverlayopen', true)
    },
    closeOverlay() {
      this.$emit('update:isoverlayopen', false)
    },
  },
}
</script>

<style>
/* text */
.pc-info {
  color: var(--black);
  font-size: 10pt;
  font-family: 'Proxima Nova', Arial;
}

.pc-info a,
.pc-info p,
.pc-info li {
  color: inherit;
  padding-top: 0pt;
  padding-bottom: 8pt;
  line-height: 1.15;
  orphans: 2;
  widows: 2;
  text-align: left;
}

.pc-info a {
  cursor: pointer;
}

/* overlay */

.pc-overlay-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--fade-black);
}
.pc-overlay-text {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 900px;
  max-width: 90vw;
  height: calc(100vh - 40px);
  padding: 20px;
  box-sizing: border-box;
  background: var(--white);
  overflow-y: auto;
}
.pc-overlay-close {
  position: fixed;
  top: 20px;
  right: 20px;
  border: none;
  background: transparent;
  -webkit-appearance: none;
  -webkit-border-radius: 0;
  margin: 0;
  padding: 0;
}
</style>
