package org.bigbluebutton.presentation.imp;

import org.jodconverter.core.office.OfficeContext;
import org.jodconverter.local.filter.Filter;
import org.jodconverter.local.filter.FilterChain;
import org.jodconverter.local.office.utils.Lo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sun.star.lang.XComponent;
import com.sun.star.sheet.XCalculatable;

public class OfficeDocumentConversionFilter implements Filter {

  private static Logger log = LoggerFactory.getLogger(OfficeDocumentConversionFilter.class);

  @Override
  public void doFilter(OfficeContext context, XComponent document, FilterChain chain)
      throws Exception {

    log.info("Applying the OfficeDocumentConversionFilter");
    Lo.qiOptional(XCalculatable.class, document).ifPresent((x) -> {
      log.info("Turn AutoCalculate off");
      x.enableAutomaticCalculation(false);
    });

    chain.doFilter(context, document);
  }
}
