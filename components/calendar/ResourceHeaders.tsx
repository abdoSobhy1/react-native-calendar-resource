import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  CalendarDimensions,
  RenderResourceHeaderFunction,
  Resource,
} from "../../types/calendar";

type ResourceHeadersProps = {
  resources: Resource[];
  scrollRef: React.RefObject<ScrollView | null>;
  dimensions: CalendarDimensions;
  renderResourceHeader?: RenderResourceHeaderFunction;
  onResourcePress?: (resource: Resource) => void;
};

export function ResourceHeaders({
  resources,
  scrollRef,
  dimensions,
  renderResourceHeader,
  onResourcePress,
}: ResourceHeadersProps) {
  return (
    <View style={{ flexDirection: "row", zIndex: 10 }}>
      <View
        style={{
          backgroundColor: "#262626",
          borderBottomWidth: 1,
          borderBottomColor: "#333",
          zIndex: 20,
          width: dimensions.resourceWidth,
        }}
      />
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        bounces={false}
        style={{ flex: 1 }}>
        <View style={{ flexDirection: "row" }}>
          {resources.map((resource) => (
            <Pressable
              key={resource.id}
              onPress={() => onResourcePress?.(resource)}
              style={{
                justifyContent: "center",
                backgroundColor: "#262626",
                borderLeftWidth: 1,
                borderBottomWidth: 1,
                borderColor: "#333",
                paddingVertical: 16,
                paddingHorizontal: 10,
                width: dimensions.resourceWidth,
                height: dimensions.resourceWidth,
              }}>
              {renderResourceHeader ? (
                renderResourceHeader(resource)
              ) : (
                <Text
                  style={{ color: "#fefefe", fontSize: 14, textAlign: "left" }}>
                  {resource.label}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
