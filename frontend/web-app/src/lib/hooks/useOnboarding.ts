"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export type OnboardingStep = 'config' | 'team' | 'finish';

interface WorkspaceConfig {
    dbConnection: string;
    region: string;
    timezone: string;
}

interface TeamConfig {
    teamName: string;
    members: string[]; // email addresses
}

export function useOnboarding() {
    const router = useRouter();
    const [step, setStep] = useState<OnboardingStep>('config');
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [workspaceConfig, setWorkspaceConfig] = useState<WorkspaceConfig>({
        dbConnection: '',
        region: 'us-east-1',
        timezone: 'UTC',
    });

    const [teamConfig, setTeamConfig] = useState<TeamConfig>({
        teamName: '',
        members: [],
    });

    const submitConfig = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, we would PUT /api/orgs/config or similar
        console.log('Submitted config:', workspaceConfig);

        setIsLoading(false);
        setStep('team');
    };

    const submitTeam = async () => {
        setIsLoading(true);
        // Simulate API call to create team
        // await teamsApi.create({ name: teamConfig.teamName, ... })
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Created team:', teamConfig);

        setIsLoading(false);
        setStep('finish');
    };

    const finishOnboarding = () => {
        toast.success("You're all set!");
        router.push('/');
    };

    return {
        step,
        isLoading,
        workspaceConfig,
        setWorkspaceConfig,
        teamConfig,
        setTeamConfig,
        submitConfig,
        submitTeam,
        finishOnboarding
    };
}
