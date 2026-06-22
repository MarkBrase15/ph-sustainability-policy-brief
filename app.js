/* ==========================================================================
   Philippines LGU Policy Brief - JavaScript Logic
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // 1. Core DOM Elements
    // -------------------------------------------------------------
    const themeToggle = document.getElementById("themeToggle");
    const scrollIndicator = document.getElementById("scrollIndicator");
    const navLinks = document.querySelectorAll(".nav-link, .vertical-nav a");
    const sections = document.querySelectorAll(".document-section");

    // Simulator Inputs
    const citySizeInput = document.getElementById("citySize");
    const plasticFeeInput = document.getElementById("plasticFee");
    const carbonTaxInput = document.getElementById("carbonTax");

    // Simulator Value Displays
    const plasticFeeVal = document.getElementById("plasticFeeVal");
    const carbonTaxVal = document.getElementById("carbonTaxVal");

    // Simulator Outputs
    const outRevenue = document.getElementById("outRevenue");
    const outPlasticRed = document.getElementById("outPlasticRed");
    const outPlasticBagsSaved = document.getElementById("outPlasticBagsSaved");
    const outTippingSaved = document.getElementById("outTippingSaved");
    const outMangroves = document.getElementById("outMangroves");
    const outJobs = document.getElementById("outJobs");
    
    // Sustainability Index
    const indexBar = document.getElementById("indexBar");
    const indexVal = document.getElementById("indexVal");
    const indexVerdict = document.getElementById("indexVerdict");

    // Ordinance Builder Customizer
    const lguTypeSelect = document.getElementById("lguType");
    const lguNameInput = document.getElementById("lguName");
    const provinceNameInput = document.getElementById("provinceName");

    // Ordinance Text Spans
    const ordSangguniangType = document.getElementById("ordSangguniangType");
    const ordLguHeader = document.getElementById("ordLguHeader");
    const ordLguTypeUpper = document.getElementById("ordLguTypeUpper");
    const ordLguNameUpper = document.getElementById("ordLguNameUpper");
    const ordSangguniangBodyType = document.getElementById("ordSangguniangBodyType");
    const ordLguNameBody = document.getElementById("ordLguNameBody");
    const ordPlasticFeeText = document.getElementById("ordPlasticFeeText");
    const ordCarbonTaxText = document.getElementById("ordCarbonTaxText");

    // Actions
    const copyOrdinanceBtn = document.getElementById("copyOrdinanceBtn");
    const downloadOrdinanceBtn = document.getElementById("downloadOrdinanceBtn");

    // -------------------------------------------------------------
    // 2. Theme Toggle System
    // -------------------------------------------------------------
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });

    // -------------------------------------------------------------
    // 3. Scroll & Navigation Link Highlight
    // -------------------------------------------------------------
    window.addEventListener("scroll", () => {
        // Update reading progress bar at top
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollIndicator.style.width = scrolled + "%";

        // Highlight active navigation link based on viewport position
        let currentSectionId = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (winScroll >= sectionTop) {
                currentSectionId = section.getAttribute("id");
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${currentSectionId}`) {
                    link.classList.add("active");
                }
            });
        }
    });

    // -------------------------------------------------------------
    // 4. Accordion Toggle System
    // -------------------------------------------------------------
    window.toggleAccordion = (header) => {
        const item = header.parentElement;
        const isOpen = item.classList.contains("open");
        
        // Close all items in the accordion
        const allItems = item.parentElement.querySelectorAll(".accordion-item");
        allItems.forEach(i => i.classList.remove("open"));

        // Toggle the clicked one
        if (!isOpen) {
            item.classList.add("open");
        }
    };

    // -------------------------------------------------------------
    // 5. Simulator Math & Update Logic
    // -------------------------------------------------------------
    
    // Baselines based on City Size Selector
    const cityBaselines = {
        large: {
            population: 500000,
            dailyPlasticBags: 300000,
            carbonTonsYear: 80000
        },
        medium: {
            population: 150000,
            dailyPlasticBags: 90000,
            carbonTonsYear: 24000
        },
        small: {
            population: 50000,
            dailyPlasticBags: 30000,
            carbonTonsYear: 8000
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            maximumFractionDigits: 0
        }).format(val);
    };

    const formatNumber = (val) => {
        return new Intl.NumberFormat("en-US").format(val);
    };

    const updateSimulatorOutputs = () => {
        const citySize = citySizeInput.value;
        const plasticFee = parseFloat(plasticFeeInput.value);
        const carbonTax = parseFloat(carbonTaxInput.value);

        // Update Slider Display values
        plasticFeeVal.textContent = `PHP ${plasticFee.toFixed(2)}`;
        carbonTaxVal.textContent = `PHP ${formatNumber(carbonTax)}`;

        const baseline = cityBaselines[citySize];

        // 1. PLASTIC BAG REDUCTION & CO-BENEFITS
        // Exponential decay model for plastic bag reduction based on price fee.
        // At PHP 0, reduction is 0%. At PHP 3.00, reduction is ~70%. At PHP 10.00, reduction is ~95%.
        let plasticReductionRate = 0;
        if (plasticFee > 0) {
            plasticReductionRate = 1 - Math.exp(-0.75 * plasticFee);
            // Cap it at 96% to reflect essential uses
            if (plasticReductionRate > 0.96) plasticReductionRate = 0.96;
        }

        const dailyBagsSaved = baseline.dailyPlasticBags * plasticReductionRate;
        const annualBagsSaved = dailyBagsSaved * 365;
        const remainingAnnualBags = (baseline.dailyPlasticBags * (1 - plasticReductionRate)) * 365;

        // Plastic revenue generated for the LGU (assume PHP 1.00 per bag goes directly to the LGU Green Trust Fund)
        // Retailers keep a portion for administration or we charge a markup
        const plasticAnnualRevenue = remainingAnnualBags * plasticFee;

        // Landfill hauling/tipping cost savings:
        // 1 bag ≈ 5 grams (0.000005 tons). Hauling fee ≈ PHP 800 per ton in urban areas.
        const tonsSaved = annualBagsSaved * 0.000005;
        const tippingSavings = tonsSaved * 900; // PHP 900 average hauling cost per ton

        // 2. CARBON OFFSET TAX & MANGROVES
        // Assume large businesses choose to purchase local offsets for 40% of the city's commercial carbon footprint
        // to avoid national audits or comply with local green building codes.
        const carbonOffsetTons = baseline.carbonTonsYear * 0.40;
        const carbonAnnualRevenue = carbonOffsetTons * carbonTax;

        // Mangrove restoration costs PHP 150,000 per hectare (including nursery, planting, and guarding over 3 years)
        const costPerHectareMangrove = 150000;
        const hectaresMangrovesRestored = carbonAnnualRevenue / costPerHectareMangrove;

        // jobs created: 1 hectare supports approximately 2 local community rangers/planters (part-time or full-time)
        const jobsCreated = hectaresMangrovesRestored * 1.5;

        // 3. COMBINED IMPACTS
        const totalAnnualRevenue = plasticAnnualRevenue + carbonAnnualRevenue;

        // Update UI Outputs
        outRevenue.textContent = formatCurrency(totalAnnualRevenue);
        outPlasticRed.textContent = `${(plasticReductionRate * 100).toFixed(0)}%`;
        outPlasticBagsSaved.textContent = `${(annualBagsSaved / 1000000).toFixed(1)}M bags saved/yr`;
        outTippingSaved.textContent = formatCurrency(tippingSavings);
        outMangroves.textContent = `${hectaresMangrovesRestored.toFixed(1)} Hectares`;
        outJobs.textContent = `Creates ~${Math.max(0, Math.round(jobsCreated))} green jobs`;

        // 4. INDEX CALCULATION (0 - 100)
        // Environmental score is based on plastic reduction progress (50%) and carbon offset adoption (50%)
        const plasticScore = plasticReductionRate * 100;
        const carbonScore = (carbonTax / 1500) * 100;
        const sustainabilityIndex = Math.round((plasticScore * 0.5) + (carbonScore * 0.5));

        indexBar.style.width = `${sustainabilityIndex}%`;
        indexVal.textContent = `${sustainabilityIndex}/100`;

        // Update Index Verdict
        let verdict = "";
        if (sustainabilityIndex < 30) {
            verdict = "Low Sustainability: Policy settings are insufficient to drive meaningful local change. Environmental negative externalities remain unaddressed.";
            indexBar.style.background = "linear-gradient(90deg, #EF4444 0%, #F59E0B 100%)";
        } else if (sustainabilityIndex < 70) {
            verdict = "Moderate Sustainability: Good local baseline. Plastic reduction is notable, but carbon offset tariffs could be raised to fund larger scale coastal mangrove networks.";
            indexBar.style.background = "linear-gradient(90deg, #F59E0B 0%, #10B981 100%)";
        } else {
            verdict = "High Sustainability: Outstanding policy framework! Optimally internalizes environmental costs, generating significant local green capital and jobs.";
            indexBar.style.background = "linear-gradient(90deg, #10B981 0%, #34D399 100%)";
        }
        indexVerdict.textContent = verdict;

        // 5. UPDATE ORDINANCE BUILDER VARIABLES
        ordPlasticFeeText.textContent = `PHP ${plasticFee.toFixed(2)}`;
        ordCarbonTaxText.textContent = `PHP ${formatNumber(carbonTax)}.00`;
    };

    // -------------------------------------------------------------
    // 6. Ordinance Text Form Updates
    // -------------------------------------------------------------
    const updateOrdinanceWording = () => {
        const lguType = lguTypeSelect.value;
        const lguName = lguNameInput.value.trim() || "[City/Municipality Name]";
        const province = provinceNameInput.value.trim() || "[Province]";

        // Headers
        ordSangguniangType.textContent = lguType === "City" ? "PANLUNGSOD" : "BAYAN";
        ordSangguniangBodyType.textContent = lguType === "City" ? "Panlungsod" : "Bayan";
        
        ordLguHeader.textContent = `${lguType} of ${lguName}, Province of ${province}`;
        ordLguTypeUpper.textContent = lguType.toUpperCase();
        ordLguNameUpper.textContent = lguName.toUpperCase();
        ordLguNameBody.textContent = lguName;
    };

    // Event Listeners for Simulator Controls
    citySizeInput.addEventListener("change", updateSimulatorOutputs);
    plasticFeeInput.addEventListener("input", updateSimulatorOutputs);
    carbonTaxInput.addEventListener("input", updateSimulatorOutputs);

    // Event Listeners for Ordinance Customizer
    lguTypeSelect.addEventListener("change", () => {
        updateOrdinanceWording();
        updateSimulatorOutputs();
    });
    lguNameInput.addEventListener("input", updateOrdinanceWording);
    provinceNameInput.addEventListener("input", updateOrdinanceWording);

    // -------------------------------------------------------------
    // 7. Action Buttons (Copy & Download)
    // -------------------------------------------------------------
    
    // Helper to get raw ordinance text
    const getOrdinanceText = () => {
        const lguType = lguTypeSelect.value;
        const lguName = lguNameInput.value.trim() || "Liloan";
        const province = provinceNameInput.value.trim() || "Cebu";
        const plasticFee = parseFloat(plasticFeeInput.value).toFixed(2);
        const carbonTax = formatNumber(parseFloat(carbonTaxInput.value));

        const sangguniang = lguType === "City" ? "SANGGUNIANG PANLUNGSOD" : "SANGGUNIANG BAYAN";
        const bodyType = lguType === "City" ? "Panlungsod" : "Bayan";

        return `REPUBLIC OF THE PHILIPPINES
${sangguniang}
Office of the Secretary to the Sanggunian
${lguType} of ${lguName}, Province of ${province}

ORDINANCE NO. ____, SERIES OF 2026

AN ORDINANCE CREATING AN ENVIRONMENTAL RECOVERY TRUST FUND, LEVYING AN ECO-FEE ON SINGLE-USE PLASTICS, AND ESTABLISHING A LOCAL CARBON COMPENSATION SYSTEM IN THE ${lguType.toUpperCase()} OF ${lguName.toUpperCase()}.

WHEREAS, Section 16 of Republic Act No. 7160, otherwise known as the Local Government Code of 1991, mandates all Local Government Units to ensure and promote the health and safety of their inhabitants, and enhance the right of the people to a balanced and healthful ecology;

WHEREAS, Section 186 of R.A. No. 7160 grants LGUs the authority to levy taxes, fees, or charges on any base or subject not otherwise specifically enumerated or taxed under national laws;

NOW, THEREFORE, BE IT ORDAINED by the Sangguniang ${bodyType} of ${lguName}, in session assembled, that:

SECTION 1. TITLE.
This Ordinance shall be known as the "LGU Sustainability Incentives Act of 2026."

SECTION 2. REGULATORY POINT-OF-SALE PLASTIC BAG FEE.
There is hereby levied an Environmental Eco-Fee of PHP ${plasticFee} on every single-use plastic bag provided to consumers at any point of sale in commercial establishments, supermarkets, department stores, and fast-food chains within the municipal boundaries.

SECTION 3. LOCAL CARBON COMPENSATORY OFFSET TARIFF.
All category-A commercial developments, warehouses, and industrial structures operating within the LGU shall compensate for their estimated scope-2 carbon emissions by paying a local carbon offset tariff of PHP ${carbonTax}.00 per metric ton of CO₂ equivalent, unless said businesses purchase equivalent municipal forestry/mangrove carbon credits.

SECTION 4. CREATION OF SPECIAL TRUST ACCOUNT.
All revenues collected under Sections 2 and 3 of this Ordinance shall be deposited directly into a designated LGU Special Trust Account for the Environment, which shall be audit-segregated from the general fund and utilized solely for local reforestation, recycling facility operations, and clean energy projects.

SECTION 5. SEPARABILITY CLAUSE.
If any provision of this Ordinance is declared unconstitutional or invalid, the other provisions not affected thereby shall continue in full force and effect.`;
    };

    // Copy to Clipboard
    copyOrdinanceBtn.addEventListener("click", () => {
        const text = getOrdinanceText();
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyOrdinanceBtn.innerHTML;
            copyOrdinanceBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
            setTimeout(() => {
                copyOrdinanceBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error("Could not copy text: ", err);
            alert("Failed to copy ordinance text. You can select it manually.");
        });
    });

    // Download Text File
    downloadOrdinanceBtn.addEventListener("click", () => {
        const text = getOrdinanceText();
        const lguName = lguNameInput.value.trim() || "liloan";
        const filename = `${lguName.toLowerCase()}_sustainability_incentives_ordinance.txt`;
        
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });

    // -------------------------------------------------------------
    // 8. Initialization
    // -------------------------------------------------------------
    updateSimulatorOutputs();
    updateOrdinanceWording();
});
