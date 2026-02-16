// CRM Module TypeScript Types
// Matching backend DTOs from internal/dto/crm.go

export interface Opportunity {
    id: string;
    title: string;
    value: number;
    currency: string;
    stage: 'new' | 'discovery' | 'demo' | 'negotiation' | 'closed_won' | 'closed_lost';
    probability: number;
    expected_close_date?: string;
    owner_id?: string;
    created_at: string;
    updated_at: string;
    // Populated via joins
    owner_name?: string;
}

export interface CreateOpportunityRequest {
    title: string;
    value?: number;
    currency?: string;
    stage?: string;
    probability?: number;
    expected_close_date?: string;
    owner_id?: string;
}

export interface UpdateOpportunityRequest {
    title?: string;
    value?: number;
    currency?: string;
    stage?: string;
    probability?: number;
    expected_close_date?: string;
    owner_id?: string;
}

export interface Contact {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_name: string;
    role: 'decision_maker' | 'influencer' | 'champion' | 'blocker';
    created_at: string;
    updated_at: string;
}

export interface CreateContactRequest {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    company_name?: string;
    role?: string;
}

export interface UpdateContactRequest {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company_name?: string;
    role?: string;
}

export interface Timeline {
    id: string;
    name: string;
    start_date?: string;
    end_date?: string;
    target_revenue: number;
    created_at: string;
}

export interface CreateTimelineRequest {
    name: string;
    start_date?: string;
    end_date?: string;
    target_revenue?: number;
}

export interface UpdateTimelineRequest {
    name?: string;
    start_date?: string;
    end_date?: string;
    target_revenue?: number;
}

export interface Channel {
    id: string;
    name: string;
    type: 'inbound' | 'outbound' | 'partner';
    spend: number;
    created_at: string;
}

export interface CreateChannelRequest {
    name: string;
    type?: string;
    spend?: number;
}

export interface UpdateChannelRequest {
    name?: string;
    type?: string;
    spend?: number;
}

export interface PainPoint {
    id: string;
    opportunity_id?: string;
    description: string;
    severity: 'blocker' | 'major' | 'minor';
    created_at: string;
    // Populated via joins
    opportunity_title?: string;
}

export interface CreatePainPointRequest {
    opportunity_id?: string;
    description: string;
    severity?: string;
}

export interface UpdatePainPointRequest {
    opportunity_id?: string;
    description?: string;
    severity?: string;
}

export interface Collateral {
    id: string;
    title: string;
    content_url: string;
    type: 'proposal' | 'quote' | 'contract' | 'presentation';
    created_at: string;
    updated_at: string;
}

export interface CreateCollateralRequest {
    title: string;
    content_url?: string;
    type?: string;
}

export interface UpdateCollateralRequest {
    title?: string;
    content_url?: string;
    type?: string;
}
