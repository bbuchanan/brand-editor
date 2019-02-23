import React, { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";

import BrandGrid from "./BrandGrid";
import CategoryGrid from "./CategoryGrid";
import SubcategoryGrid from "./SubcategoryGrid";
import PopupGrid from "./PopupGrid";
import FloorGrid from "./FloorGrid";

const navTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
      <TabPanel header="Brands">
        <BrandGrid />
      </TabPanel>
      <TabPanel header="Categories">
        <CategoryGrid />
      </TabPanel>
      <TabPanel header="Subcategories">
        <SubcategoryGrid />
      </TabPanel>
      <TabPanel header="Popup Texts">
        <PopupGrid />
      </TabPanel>
      <TabPanel header="Floors">
        <FloorGrid />
      </TabPanel>
    </TabView>
  );
};

export default navTabs;
