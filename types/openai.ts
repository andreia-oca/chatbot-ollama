export interface OpenAiModel {
    id: string;
    name: string;
    created_at?: string;
}

export enum OpenAiModelID {
    DEFAULT_MODEL = 'gpt-4o'
}

export const fallbackModelID = OpenAiModelID.DEFAULT_MODEL;

export const OpenAiModels: Record<OpenAiModelID, OpenAiModel> = {
    [OpenAiModelID.DEFAULT_MODEL]: {
        id: 'gpt-4o',
        name: 'gpt-4o',
    },
};
