<?xml version="1.0" encoding="utf-8"?>
<project path="" name="Magento-Admin" author="Andrey Korolyov" version="0.0.1" copyright="$projectName&#xD;&#xA;Copyright(c) Varien inc. 2006-2007, $author." output="$project" source="False" source-dir="$output\source" minify="False" min-dir="$output" doc="False" doc-dir="$output\docs" master="true" master-file="$output\yui-ext.js" zip="true" zip-file="$output\yuo-ext.$version.zip">
  <directory name="" />
  <file name="auth\menu.js" path="auth" />
  <file name="catalog\category\attributes.js" path="catalog\category" />
  <file name="catalog\category\createform.js" path="catalog\category" />
  <file name="catalog\product\attributes.js" path="catalog\product" />
  <file name="catalog\product\link.js" path="catalog\product" />
  <file name="catalog\product\productselect.js" path="catalog\product" />
  <file name="catalog\category.js" path="catalog" />
  <file name="catalog\menu.js" path="catalog" />
  <file name="catalog\product.js" path="catalog" />
  <file name="catalog\tree.js" path="catalog" />
  <file name="core\blocks.js" path="core" />
  <file name="core\config.js" path="core" />
  <file name="core\media.js" path="core" />
  <file name="core\menu.js" path="core" />
  <file name="customer\menu.js" path="customer" />
  <file name="sales\menu.js" path="sales" />
  <file name="auth.js" path="" />
  <file name="catalog.js" path="" />
  <file name="core.js" path="" />
  <file name="customer.js" path="" />
  <file name="form.js" path="" />
  <file name="mage.js" path="" />
  <file name="sales.js" path="" />
  <target name="magento-all" file="$output\magento-all.js" debug="False" shorthand="False" shorthand-list="YAHOO.util.Dom.setStyle&#xD;&#xA;YAHOO.util.Dom.getStyle&#xD;&#xA;YAHOO.util.Dom.getRegion&#xD;&#xA;YAHOO.util.Dom.getViewportHeight&#xD;&#xA;YAHOO.util.Dom.getViewportWidth&#xD;&#xA;YAHOO.util.Dom.get&#xD;&#xA;YAHOO.util.Dom.getXY&#xD;&#xA;YAHOO.util.Dom.setXY&#xD;&#xA;YAHOO.util.CustomEvent&#xD;&#xA;YAHOO.util.Event.addListener&#xD;&#xA;YAHOO.util.Event.getEvent&#xD;&#xA;YAHOO.util.Event.getTarget&#xD;&#xA;YAHOO.util.Event.preventDefault&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Event.stopPropagation&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Anim&#xD;&#xA;YAHOO.util.Motion&#xD;&#xA;YAHOO.util.Connect.asyncRequest&#xD;&#xA;YAHOO.util.Connect.setForm&#xD;&#xA;YAHOO.util.Dom&#xD;&#xA;YAHOO.util.Event">
    <include name="mage.js" />
    <include name="form.js" />
    <include name="core.js" />
    <include name="core\menu.js" />
    <include name="core\blocks.js" />
    <include name="core\config.js" />
    <include name="core\media.js" />
    <include name="auth.js" />
    <include name="auth\menu.js" />
    <include name="customer.js" />
    <include name="customer\menu.js" />
    <include name="catalog\product\productselect.js" />
    <include name="catalog.js" />
    <include name="catalog\product.js" />
    <include name="catalog\product\attributes.js" />
    <include name="catalog\product\link.js" />
    <include name="catalog\category\attributes.js" />
    <include name="catalog\category.js" />
    <include name="catalog\category\createform.js" />
    <include name="catalog\tree.js" />
    <include name="catalog\menu.js" />
    <include name="sales.js" />
    <include name="sales\menu.js" />
  </target>
</project>