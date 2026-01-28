package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type Storage struct {
	mu      sync.RWMutex
	dataDir string
}

func NewStorage() *Storage {
	return &Storage{}
}

func (s *Storage) Init() error {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return err
	}
	s.dataDir = filepath.Join(configDir, "ForgeFlow")
	return os.MkdirAll(s.dataDir, 0755)
}

func (s *Storage) getFlowsDir() string {
	flowsDir := filepath.Join(s.dataDir, "flows")
	os.MkdirAll(flowsDir, 0755)
	return flowsDir
}

func (s *Storage) SaveFlow(flowJSON string) (string, error) {
	if s.dataDir == "" {
		if err := s.Init(); err != nil {
			return "", err
		}
	}

	var flow Flow
	if err := json.Unmarshal([]byte(flowJSON), &flow); err != nil {
		return "", fmt.Errorf("invalid flow JSON: %w", err)
	}

	if flow.ID == "" {
		flow.ID = fmt.Sprintf("flow-%d", time.Now().UnixNano())
		flow.CreatedAt = time.Now().Format(time.RFC3339)
	}
	flow.UpdatedAt = time.Now().Format(time.RFC3339)

	data, err := json.MarshalIndent(flow, "", "  ")
	if err != nil {
		return "", err
	}

	filePath := filepath.Join(s.getFlowsDir(), flow.ID+".json")
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return "", err
	}

	return flow.ID, nil
}

func (s *Storage) LoadFlow(flowID string) (string, error) {
	if s.dataDir == "" {
		if err := s.Init(); err != nil {
			return "", err
		}
	}

	filePath := filepath.Join(s.getFlowsDir(), flowID+".json")
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("flow not found: %s", flowID)
	}
	return string(data), nil
}

func (s *Storage) ListFlows() ([]map[string]interface{}, error) {
	if s.dataDir == "" {
		if err := s.Init(); err != nil {
			return nil, err
		}
	}

	flowsDir := s.getFlowsDir()
	entries, err := os.ReadDir(flowsDir)
	if err != nil {
		return []map[string]interface{}{}, nil
	}

	var flows []map[string]interface{}
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}

		filePath := filepath.Join(flowsDir, entry.Name())
		data, err := os.ReadFile(filePath)
		if err != nil {
			continue
		}

		var flow map[string]interface{}
		if err := json.Unmarshal(data, &flow); err != nil {
			continue
		}

		flows = append(flows, map[string]interface{}{
			"id":          flow["id"],
			"name":        flow["name"],
			"description": flow["description"],
			"enabled":     flow["enabled"],
			"createdAt":   flow["createdAt"],
			"updatedAt":   flow["updatedAt"],
			"nodeCount":   len(flow["nodes"].([]interface{})),
		})
	}

	return flows, nil
}

func (s *Storage) DeleteFlow(flowID string) error {
	if s.dataDir == "" {
		if err := s.Init(); err != nil {
			return err
		}
	}

	filePath := filepath.Join(s.getFlowsDir(), flowID+".json")
	return os.Remove(filePath)
}

func (s *Storage) SaveSettings(settingsJSON string) error {
	if s.dataDir == "" {
		if err := s.Init(); err != nil {
			return err
		}
	}

	filePath := filepath.Join(s.dataDir, "settings.json")
	return os.WriteFile(filePath, []byte(settingsJSON), 0644)
}

func (s *Storage) LoadSettings() (string, error) {
	if s.dataDir == "" {
		if err := s.Init(); err != nil {
			return "", err
		}
	}

	filePath := filepath.Join(s.dataDir, "settings.json")
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "{}", nil
	}
	return string(data), nil
}
