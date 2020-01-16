package com.paquery.packages.domain.projections;

import com.paquery.packages.domain.ShippingSchedule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Set;

@Projection(name = "shippingSchedulePickupProjection", types = {ShippingSchedule.class})
public interface ShippingSchedulePickupProjection {

    long getId();

    String getName();

    String getComment();

    LocalDateTime getScheduledDate();

    String getAddressDetail();

    String getDestinationEmail();

    @Value("#{target.getScheduleType().getValue()}")
    Integer getScheduleType();

    String getDestinationDocNumber();

    String getDestinationAclaration();

    ShippingAddressProjection getShippingAddress();
}
